const mongoose = require('mongoose')
const Category = require('../models/Category')
const Product = require('../models/Product')
const assistantLogger = require('../utils/assistantLogger')

const SORT_OPTIONS = {
    price_asc: { sellingPrice: 1 },
    price_desc: { sellingPrice: -1 },
    rating: { rating: -1, noOfRatings: -1 },
    newest: { createdAt: -1 },
}

function logMeta(ctx, extra = {}) {
    return { requestId: ctx?.requestId, ...extra }
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function parseNumber(value) {
    if (value === undefined || value === null || value === '') return undefined
    const num = Number(value)
    return Number.isFinite(num) ? num : undefined
}

function parseBoolean(value) {
    if (value === true || value === 'true') return true
    if (value === false || value === 'false') return false
    return undefined
}

async function resolveCategoryId(category, ctx) {
    if (!category?.trim()) return undefined

    const trimmed = category.trim()

    assistantLogger.info('search', 'Resolving category', logMeta(ctx, { category: trimmed }))

    if (mongoose.Types.ObjectId.isValid(trimmed)) {
        const categoryDoc = await Category.findOne({ _id: trimmed, isActive: true }).select('_id')
        assistantLogger.info('search', 'Category resolved by id', logMeta(ctx, {
            category: trimmed,
            found: Boolean(categoryDoc),
        }))
        return categoryDoc?._id
    }

    const categoryDoc = await Category.findOne({
        title: { $regex: escapeRegex(trimmed), $options: 'i' },
        isActive: true,
    }).select('_id')

    assistantLogger.info('search', 'Category resolved by title', logMeta(ctx, {
        category: trimmed,
        found: Boolean(categoryDoc),
    }))

    return categoryDoc?._id
}

async function buildSearchFilter({ query, minPrice, maxPrice, category, inStock }, ctx) {
    assistantLogger.info('search', 'Building MongoDB filter', logMeta(ctx, {
        query,
        minPrice,
        maxPrice,
        category,
        inStock,
    }))

    const filter = { isActive: true }

    const trimmedQuery = query?.trim()
    if (trimmedQuery) {
        const terms = trimmedQuery.split(/\s+/).filter(Boolean)
        filter.$and = terms.map((term) => ({
            $or: [
                { title: { $regex: escapeRegex(term), $options: 'i' } },
                { description: { $regex: escapeRegex(term), $options: 'i' } },
                { brand: { $regex: escapeRegex(term), $options: 'i' } },
            ],
        }))
    }

    const min = parseNumber(minPrice)
    const max = parseNumber(maxPrice)
    if (min !== undefined || max !== undefined) {
        filter.sellingPrice = {}
        if (min !== undefined) filter.sellingPrice.$gte = min
        if (max !== undefined) filter.sellingPrice.$lte = max
    }

    if (category?.trim()) {
        const categoryId = await resolveCategoryId(category, ctx)
        if (!categoryId) {
            assistantLogger.warn('search', 'Category not found', logMeta(ctx, { category }))
            return { filter: null, categoryNotFound: true }
        }
        filter.categoryId = categoryId
    }

    if (parseBoolean(inStock) === true) {
        filter.stockQuantity = { $gt: 0 }
    }

    assistantLogger.info('search', 'MongoDB filter built', logMeta(ctx, { filter }))

    return { filter, categoryNotFound: false }
}

async function searchProducts({
    query,
    minPrice,
    maxPrice,
    category,
    inStock,
    sort,
    page = 1,
    limit = 10,
} = {}, ctx) {
    const startedAt = Date.now()

    assistantLogger.info('search', 'Product search started', logMeta(ctx, {
        query,
        minPrice,
        maxPrice,
        category,
        inStock,
        sort,
        page,
        limit,
    }))

    const pageNum = Math.max(1, parseInt(page, 10) || 1)
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10))
    const skip = (pageNum - 1) * limitNum

    const { filter, categoryNotFound } = await buildSearchFilter({
        query,
        minPrice,
        maxPrice,
        category,
        inStock,
    }, ctx)

    if (categoryNotFound) {
        assistantLogger.warn('search', 'Search aborted due to unknown category', logMeta(ctx, {
            category,
            durationMs: Date.now() - startedAt,
        }))

        return {
            products: [],
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: 0,
                totalPages: 0,
                hasMore: false,
            },
            message: 'No matching category found',
        }
    }

    const sortOption = SORT_OPTIONS[sort] || SORT_OPTIONS.newest

    const [products, total] = await Promise.all([
        Product.find(filter)
            .populate('categoryId', 'title')
            .sort(sortOption)
            .skip(skip)
            .limit(limitNum)
            .lean(),
        Product.countDocuments(filter),
    ])

    const totalPages = total === 0 ? 0 : Math.ceil(total / limitNum)

    assistantLogger.info('search', 'Product search completed', logMeta(ctx, {
        matched: total,
        returned: products.length,
        page: pageNum,
        limit: limitNum,
        sort: sort || 'newest',
        durationMs: Date.now() - startedAt,
        productTitles: products.slice(0, 5).map((product) => product.title),
    }))

    return {
        products: products.map((product) => ({
            id: product._id,
            title: product.title,
            brand: product.brand,
            description: product.description,
            sellingPrice: product.sellingPrice,
            mrpPrice: product.mrpPrice,
            inStock: product.stockQuantity > 0,
            stockQuantity: product.stockQuantity,
            rating: product.rating,
            noOfRatings: product.noOfRatings,
            category: product.categoryId?.title || null,
            image: product.images?.[0] || null,
        })),
        pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages,
            hasMore: pageNum < totalPages,
        },
    }
}

module.exports = { searchProducts, buildSearchFilter }
