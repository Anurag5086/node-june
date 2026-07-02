const Category = require('../models/Category')
const { searchProducts } = require('./productSearchService')
const { callGemini, isRateLimitError } = require('./geminiApi')
const assistantLogger = require('../utils/assistantLogger')

function logMeta(ctx, extra = {}) {
    return { requestId: ctx?.requestId, ...extra }
}

function parsePrice(value) {
    if (!value) return null
    const num = Number(String(value).replace(/,/g, ''))
    return Number.isFinite(num) ? num : null
}

async function getCategoryTitles(ctx) {
    assistantLogger.info('service', 'Fetching active categories', logMeta(ctx))

    const categories = await Category.find({ isActive: true }).select('title').lean()
    const titles = categories.map((category) => category.title)

    assistantLogger.info('service', 'Categories loaded', logMeta(ctx, { count: titles.length }))

    return titles
}

function extractSearchParamsLocally(message, categories, ctx) {
    assistantLogger.info('service', 'Extracting search params locally', logMeta(ctx, {
        messagePreview: message.slice(0, 120),
    }))

    const lower = message.toLowerCase()
    const params = {
        query: message,
        minPrice: null,
        maxPrice: null,
        category: null,
        inStock: null,
        sort: null,
    }

    const betweenMatch = lower.match(
        /(?:between|from)\s*[₹rs.]?\s*([\d,]+)\s*(?:and|to|-)\s*[₹rs.]?\s*([\d,]+)/i,
    )
    const underMatch = lower.match(
        /(?:under|below|less than|max|upto|up to)\s*[₹rs.]?\s*([\d,]+)/i,
    )
    const overMatch = lower.match(
        /(?:over|above|more than|min|at least)\s*[₹rs.]?\s*([\d,]+)/i,
    )

    if (betweenMatch) {
        params.minPrice = parsePrice(betweenMatch[1])
        params.maxPrice = parsePrice(betweenMatch[2])
    } else if (underMatch) {
        params.maxPrice = parsePrice(underMatch[1])
    } else if (overMatch) {
        params.minPrice = parsePrice(overMatch[1])
    }

    for (const category of categories) {
        const categoryLower = category.toLowerCase()
        const parts = categoryLower.split(/\s*&\s*/).map((part) => part.trim())

        if (lower.includes(categoryLower) || parts.some((part) => part.length > 2 && lower.includes(part))) {
            params.category = category
            break
        }
    }

    if (/\b(in stock|in-stock|available)\b/i.test(message)) {
        params.inStock = true
    }

    if (/\b(cheapest|lowest price|affordable|budget)\b/i.test(lower)) {
        params.sort = 'price_asc'
    } else if (/\b(best rated|top rated|highest rated)\b/i.test(lower)) {
        params.sort = 'rating'
    } else if (/\b(newest|latest)\b/i.test(lower)) {
        params.sort = 'newest'
    }

    let query = message
    if (params.category) {
        query = query.replace(new RegExp(params.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), '')
    }
    query = query
        .replace(/(?:under|below|less than|over|above|more than|upto|up to|max|min)\s*[₹rs.]?\s*[\d,]+/gi, '')
        .replace(/(?:between|from)\s*[₹rs.]?\s*[\d,]+\s*(?:and|to|-)\s*[₹rs.]?\s*[\d,]+/gi, '')
        .replace(/\b(in stock|in-stock|available|cheapest|best rated|top rated|newest|latest)\b/gi, '')
        .replace(/\b(in|from|for)\s*$/gi, '')
        .trim()
        .replace(/\s+/g, ' ')

    params.query = query || message

    assistantLogger.info('service', 'Search params extracted', logMeta(ctx, { params }))

    return params
}

function formatProductsForPrompt(products) {
    if (!products.length) {
        return 'No products found matching the search.'
    }

    return products.map((product, index) => {
        const discount = product.mrpPrice > product.sellingPrice
            ? ` (MRP ₹${product.mrpPrice})`
            : ''

        return [
            `${index + 1}. ${product.title}`,
            `   Brand: ${product.brand}`,
            `   Category: ${product.category || 'Unknown'}`,
            `   Price: ₹${product.sellingPrice}${discount}`,
            `   Rating: ${product.rating}/5 (${product.noOfRatings} reviews)`,
            `   Stock: ${product.inStock ? 'In stock' : 'Out of stock'}`,
            `   ${product.description}`,
        ].join('\n')
    }).join('\n\n')
}

function buildFallbackReply(message, products) {
    if (!products.length) {
        return `I couldn't find products matching "${message}". Try different keywords, remove filters, or broaden your budget.`
    }

    const picks = products.slice(0, 3).map((product) => {
        const stock = product.inStock ? 'In stock' : 'Out of stock'
        return `• ${product.title} (${product.brand}) — ₹${product.sellingPrice} — ${stock}`
    })

    return [
        `Here are the best matches I found for "${message}":`,
        '',
        ...picks,
        '',
        'Browse the product cards below to add items to your cart.',
    ].join('\n')
}

async function generateAssistantReply(message, products, ctx) {
    assistantLogger.info('service', 'Generating Gemini reply', logMeta(ctx, {
        productCount: products.length,
        promptCatalogLength: formatProductsForPrompt(products).length,
    }))

    const catalog = formatProductsForPrompt(products)

    const prompt = `You are a friendly AI shopping assistant for an ecommerce store in India. All prices are in INR (₹).

Use ONLY the products listed below. Do not invent products, prices, or stock status.
If nothing matches, say so politely and suggest how the user can refine their search.

PRODUCT CATALOG:
${catalog}

USER: ${message}

Write a helpful, conversational reply. Recommend up to 3 best options when relevant. Mention price and why each item fits. Keep it under 120 words.`

    const reply = await callGemini(prompt, { ctx })

    assistantLogger.info('service', 'Gemini reply received', logMeta(ctx, {
        replyLength: reply.length,
    }))

    return reply
}

async function chat(message, ctx = {}) {
    assistantLogger.info('service', 'Chat pipeline started', logMeta(ctx, {
        messagePreview: message.slice(0, 120),
    }))

    const categories = await getCategoryTitles(ctx)
    const params = extractSearchParamsLocally(message, categories, ctx)

    const searchStartedAt = Date.now()

    const searchResult = await searchProducts({
        query: params.query || message,
        minPrice: params.minPrice ?? undefined,
        maxPrice: params.maxPrice ?? undefined,
        category: params.category || undefined,
        inStock: params.inStock ?? undefined,
        sort: params.sort || undefined,
        limit: 10,
    }, ctx)

    assistantLogger.info('service', 'MongoDB search finished', logMeta(ctx, {
        productCount: searchResult.products.length,
        durationMs: Date.now() - searchStartedAt,
    }))

    let reply
    let fallback = false

    try {
        reply = await generateAssistantReply(message, searchResult.products, ctx)
    } catch (error) {
        if (isRateLimitError(error)) {
            assistantLogger.warn('service', 'Gemini rate limited, using fallback reply', logMeta(ctx, {
                error: error.message,
            }))
            reply = buildFallbackReply(message, searchResult.products)
            fallback = true
        } else {
            assistantLogger.error('service', 'Gemini reply generation failed', logMeta(ctx, {
                error: error.message,
            }))
            throw error
        }
    }

    assistantLogger.info('service', 'Chat pipeline completed', logMeta(ctx, {
        fallback,
        productCount: searchResult.products.length,
        replyLength: reply.length,
        durationMs: assistantLogger.elapsedMs(ctx),
    }))

    return {
        reply,
        products: searchResult.products,
        fallback,
        searchParams: {
            query: params.query || message,
            minPrice: params.minPrice ?? null,
            maxPrice: params.maxPrice ?? null,
            category: params.category ?? null,
            inStock: params.inStock ?? null,
            sort: params.sort ?? null,
        },
    }
}

module.exports = {
    chat,
    extractSearchParamsLocally,
    generateAssistantReply,
    buildFallbackReply,
}
