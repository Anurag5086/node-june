const assistantLogger = require('../utils/assistantLogger')

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'
const REQUEST_TIMEOUT_MS = 30000

const MODEL_FALLBACKS = [
    process.env.GEMINI_MODEL,
    'gemini-flash-latest',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.5-flash',
].filter(Boolean)

let cachedModels = null
let cachedAt = 0
const MODEL_CACHE_MS = 5 * 60 * 1000

function logMeta(ctx, extra = {}) {
    return { requestId: ctx?.requestId, ...extra }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

function getApiKey() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured')
    }
    return apiKey
}

function isRateLimitError(error) {
    const message = error?.message || ''
    return message.includes('429') || message.includes('quota') || message.includes('Too Many Requests')
}

function isModelNotFoundError(error) {
    const message = error?.message || ''
    return message.includes('not found') || message.includes('not supported for generateContent')
}

function parseRetryDelayMs(error) {
    const match = String(error?.message || '').match(/retry in (\d+(?:\.\d+)?)\s*s/i)
    if (match) return Math.min(Math.ceil(parseFloat(match[1]) * 1000), 60000)
    return 5000
}

async function listGenerateContentModels(ctx) {
    assistantLogger.info('gemini', 'Listing available models', logMeta(ctx))

    const url = `${GEMINI_API_BASE}/models?key=${getApiKey()}`
    const startedAt = Date.now()
    const response = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) })
    const data = await response.json()

    if (!response.ok) {
        assistantLogger.error('gemini', 'Failed to list models', logMeta(ctx, {
            status: response.status,
            error: data?.error?.message,
            durationMs: Date.now() - startedAt,
        }))
        throw new Error(data?.error?.message || 'Failed to list Gemini models')
    }

    const models = (data.models || [])
        .filter((model) => model.supportedGenerationMethods?.includes('generateContent'))
        .map((model) => model.name.replace(/^models\//, ''))

    assistantLogger.info('gemini', 'Models listed', logMeta(ctx, {
        count: models.length,
        durationMs: Date.now() - startedAt,
    }))

    return models
}

async function getModelFallbacks(ctx) {
    if (cachedModels && Date.now() - cachedAt < MODEL_CACHE_MS) {
        assistantLogger.info('gemini', 'Using cached model list', logMeta(ctx, {
            models: cachedModels,
        }))
        return cachedModels
    }

    const configured = [...new Set(MODEL_FALLBACKS)]

    try {
        const available = await listGenerateContentModels(ctx)
        const supported = configured.filter((model) => available.includes(model))

        if (supported.length > 0) {
            cachedModels = supported
            cachedAt = Date.now()
            assistantLogger.info('gemini', 'Resolved model fallbacks from config', logMeta(ctx, {
                models: supported,
            }))
            return supported
        }

        const preferred = ['gemini-flash-latest', 'gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-2.5-flash']
        const autoPick = preferred.filter((model) => available.includes(model))
        if (autoPick.length > 0) {
            cachedModels = autoPick
            cachedAt = Date.now()
            assistantLogger.info('gemini', 'Resolved model fallbacks from preferred list', logMeta(ctx, {
                models: autoPick,
            }))
            return autoPick
        }

        cachedModels = available.slice(0, 3)
        cachedAt = Date.now()
        assistantLogger.warn('gemini', 'Using first available models from API', logMeta(ctx, {
            models: cachedModels,
        }))
        return cachedModels
    } catch (error) {
        cachedModels = configured
        cachedAt = Date.now()
        assistantLogger.warn('gemini', 'Model list failed, using configured fallbacks', logMeta(ctx, {
            models: configured,
            error: error.message,
        }))
        return configured
    }
}

async function generateContent(modelName, prompt, { json = false, ctx } = {}) {
    const url = `${GEMINI_API_BASE}/models/${modelName}:generateContent?key=${getApiKey()}`

    const body = {
        contents: [{ parts: [{ text: prompt }] }],
    }

    if (json) {
        body.generationConfig = { responseMimeType: 'application/json' }
    }

    assistantLogger.info('gemini', 'Sending generateContent request', logMeta(ctx, {
        model: modelName,
        promptLength: prompt.length,
        json,
    }))

    const startedAt = Date.now()

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })

    const data = await response.json()

    if (!response.ok) {
        assistantLogger.warn('gemini', 'generateContent request failed', logMeta(ctx, {
            model: modelName,
            status: response.status,
            error: data?.error?.message,
            durationMs: Date.now() - startedAt,
        }))
        const message = data?.error?.message || `HTTP ${response.status}`
        throw new Error(`[Gemini API Error]: ${message}`)
    }

    const text = data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .filter(Boolean)
        .join('') ?? ''

    if (!text) {
        assistantLogger.error('gemini', 'Empty response from model', logMeta(ctx, {
            model: modelName,
            durationMs: Date.now() - startedAt,
        }))
        throw new Error('[Gemini API Error]: Empty response from model')
    }

    assistantLogger.info('gemini', 'generateContent succeeded', logMeta(ctx, {
        model: modelName,
        responseLength: text.length,
        durationMs: Date.now() - startedAt,
    }))

    return text
}

async function callGemini(prompt, options = {}) {
    const { ctx, ...generateOptions } = options
    const models = await getModelFallbacks(ctx)
    let lastError

    assistantLogger.info('gemini', 'Starting Gemini call with fallbacks', logMeta(ctx, {
        models,
    }))

    for (const modelName of models) {
        try {
            return await generateContent(modelName, prompt, { ...generateOptions, ctx })
        } catch (error) {
            lastError = error

            if (isModelNotFoundError(error)) {
                assistantLogger.warn('gemini', 'Model unavailable, trying next fallback', logMeta(ctx, {
                    model: modelName,
                    error: error.message,
                }))
                continue
            }

            if (!isRateLimitError(error)) {
                assistantLogger.error('gemini', 'Non-retriable Gemini error', logMeta(ctx, {
                    model: modelName,
                    error: error.message,
                }))
                throw error
            }

            const delayMs = parseRetryDelayMs(error)
            assistantLogger.warn('gemini', 'Rate limited, retrying after delay', logMeta(ctx, {
                model: modelName,
                delayMs,
                error: error.message,
            }))

            await sleep(delayMs)

            try {
                return await generateContent(modelName, prompt, { ...generateOptions, ctx })
            } catch (retryError) {
                lastError = retryError
                assistantLogger.warn('gemini', 'Retry failed', logMeta(ctx, {
                    model: modelName,
                    error: retryError.message,
                }))
                if (isModelNotFoundError(retryError)) {
                    continue
                }
            }
        }
    }

    assistantLogger.error('gemini', 'All Gemini models exhausted', logMeta(ctx, {
        error: lastError?.message,
    }))

    throw lastError || new Error('[Gemini API Error]: No available models to handle the request')
}

module.exports = {
    callGemini,
    generateContent,
    listGenerateContentModels,
    isRateLimitError,
}
