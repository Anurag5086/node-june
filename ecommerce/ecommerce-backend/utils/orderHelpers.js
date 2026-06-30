const Product = require('../models/Product')

async function validateAndBuildOrderProducts(items) {
    let calculatedTotal = 0
    const orderProducts = []

    for (const item of items) {
        const product = await Product.findById(item.product)
        if (!product || !product.isActive) {
            throw new Error('Product not available')
        }
        if (product.stockQuantity < item.quantity) {
            throw new Error(`Insufficient stock for ${product.title}`)
        }
        calculatedTotal += product.sellingPrice * item.quantity
        orderProducts.push({ product: item.product, quantity: item.quantity })
    }

    return { calculatedTotal, orderProducts }
}

async function decrementStock(orderProducts) {
    for (const item of orderProducts) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stockQuantity: -item.quantity } })
    }
}

module.exports = { validateAndBuildOrderProducts, decrementStock }
