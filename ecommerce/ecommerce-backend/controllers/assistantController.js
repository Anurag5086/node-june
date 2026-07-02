const assistantService = require('../services/assistantService')
const { searchProducts } = require('../services/productSearchService')
const { assistantChatSchema, assistantSearchSchema } = require('../utils/validators')
const assistantLogger = require('../utils/assistantLogger')

exports.chat = async (req, res) => {
    const ctx = req.assistantContext

    try {
        assistantLogger.info('controller', 'Validating chat payload', {
            requestId: ctx?.requestId,
        })

        const { error } = assistantChatSchema.validate(req.body)
        if (error) {
            assistantLogger.warn('controller', 'Chat validation failed', {
                requestId: ctx?.requestId,
                reason: error.details[0].message,
            })
            return res.status(400).json({ success: false, message: error.details[0].message })
        }

        if (!process.env.GEMINI_API_KEY) {
            assistantLogger.error('controller', 'GEMINI_API_KEY missing', {
                requestId: ctx?.requestId,
            })
            return res.status(500).json({ success: false, message: 'Assistant is not configured' })
        }

        const { message } = req.body

        assistantLogger.info('controller', 'Starting assistant chat', {
            requestId: ctx?.requestId,
            messagePreview: message.trim().slice(0, 120),
            messageLength: message.trim().length,
        })

        const result = await assistantService.chat(message.trim(), ctx)

        assistantLogger.info('controller', 'Assistant chat completed', {
            requestId: ctx?.requestId,
            productCount: result.products.length,
            fallback: result.fallback,
            durationMs: assistantLogger.elapsedMs(ctx),
        })

        return res.status(200).json({
            success: true,
            message: 'Assistant reply generated successfully',
            ...result,
        })
    } catch (err) {
        const status = err.message?.includes('429') || err.message?.includes('quota') ? 503 : 500

        assistantLogger.error('controller', 'Assistant chat failed', {
            requestId: ctx?.requestId,
            statusCode: status,
            error: err.message,
            durationMs: ctx ? assistantLogger.elapsedMs(ctx) : undefined,
        })

        return res.status(status).json({
            success: false,
            message: status === 503
                ? 'AI assistant is temporarily rate-limited. Please wait a minute and try again.'
                : err.message,
        })
    }
}

exports.search = async (req, res) => {
    const ctx = req.assistantContext

    try {
        assistantLogger.info('controller', 'Validating search query', {
            requestId: ctx?.requestId,
            query: req.query,
        })

        const { error } = assistantSearchSchema.validate(req.query)
        if (error) {
            assistantLogger.warn('controller', 'Search validation failed', {
                requestId: ctx?.requestId,
                reason: error.details[0].message,
            })
            return res.status(400).json({ success: false, message: error.details[0].message })
        }

        assistantLogger.info('controller', 'Starting product search', {
            requestId: ctx?.requestId,
            params: req.query,
        })

        const result = await searchProducts(req.query, ctx)

        assistantLogger.info('controller', 'Product search completed', {
            requestId: ctx?.requestId,
            productCount: result.products.length,
            total: result.pagination?.total,
            durationMs: assistantLogger.elapsedMs(ctx),
        })

        return res.status(200).json({
            success: true,
            message: result.products.length
                ? 'Products fetched successfully'
                : 'No products found',
            ...result,
        })
    } catch (err) {
        assistantLogger.error('controller', 'Product search failed', {
            requestId: ctx?.requestId,
            error: err.message,
            durationMs: ctx ? assistantLogger.elapsedMs(ctx) : undefined,
        })

        return res.status(500).json({ success: false, message: err.message })
    }
}
