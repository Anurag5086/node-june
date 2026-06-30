const Category = require('../models/Category')
const Product = require('../models/Product')
const { createProductSchema, updateProductSchema } = require('../utils/validators')

exports.getProductById = async (req, res) => {
    try{
        const productId = req.params.id

        const product = await Product.findById(productId)
        if(!product){
            res.status(404).json({ success: false, message: "Product not available!"})
        }

        res.status(200).json({ success: true, message: "Fetched product successfully!", product })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}

exports.getAllProducts = async (req, res) => {
    try{
        const products = await Product.find({ isActive: true })
        return res.status(200).json({
            success: true,
            message: products.length
                ? "Fetched products successfully!"
                : "No products found!",
            products,
        })
    }catch(err){
        return res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}

exports.getAllProductsForCategory = async (req, res) => {
    try{
        const categoryId = req.params.categoryId
        
        const category = await Category.findById(categoryId)
        if(!category){
            res.status(404).json({ success: false, message: "Category not available!"})
        }

        const productsInCategory = await Product.find({ categoryId, isActive: true }).populate('categoryId', 'title')
        return res.status(200).json({
            success: true,
            message: productsInCategory.length
                ? "Fetched products for category successfully!"
                : "No products in this category!",
            productsInCategory,
        })
    }catch(err){
        return res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}

exports.getAllProductsForAdmin = async (req, res) => {
    try{
        const products = await Product.find()
        return res.status(200).json({
            success: true,
            message: products.length
                ? "Fetched products successfully!"
                : "No products found!",
            products,
        })
    }catch(err){
        return res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}

exports.createProduct = async (req, res) => {
    try{
        const { error } = createProductSchema.validate(req.body)
        if(error){
            res.status(400).json({ success: false, message: "Invalid Input!"})
        }

        const newProduct = new Product(req.body)

        await newProduct.save()

        res.status(201).json({ success: true, message: "Product created successfully!", product: newProduct })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}

exports.updateProduct = async (req, res) => {
    try{
        const productId = req.params.id
        const { error } = updateProductSchema.validate(req.body)
        if(error){
            res.status(400).json({ success: false, message: "Invalid Input!"})
        }

        const product = await Product.findById(productId)
        if(!product){
            res.status(404).json({ success: false, message: "Product not found!"})
        }

        const updatedProduct = await Product.findByIdAndUpdate(productId, req.body, { new: true })

        res.status(200).json({ success: true, message: "Product updated successfully!", product: updatedProduct })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}

exports.deleteProduct = async (req, res) => {
    try{
        const productId = req.params.id

        const product = await Product.findById(productId)
        if(!product){
            res.status(404).json({ success: false, message: "Products not available!"})
        }

        await Product.findByIdAndDelete(productId)

        res.status(200).json({ success: true, message: "Deleted product successfully!" })
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server Error!" })
    }
}