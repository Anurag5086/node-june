const Category = require('../models/Category')
const { getCategorySchema, createCategorySchema, updateCategorySchema } = require('../utils/validators')

exports.getCategoryById = async (req, res) => {
    try{
        const categoryId = req.params.id
        
        const { error } = getCategorySchema.validate({ categoryId })
        if(error){
            res.status(400).json({ success: false, message: "Invalid Input!"})
        }

        const categoryDetails = await Category.findById(categoryId)
        if(!categoryDetails){
            res.status(404).json({ success: false, message: "Category not found!"})
        }

        res.status(200).json({ success: true, message: "Category fetched successfully!", category: categoryDetails})
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server error!" })
    }
}

exports.getAllCategories = async (req, res) => {
    try{
        const categories = await Category.find({ isActive: true })
        if(categories.length < 1){
            res.status(400).json({ success: false, message: "Categories not found!"})
        }

        res.status(200).json({ success: true, message: "Categories fetched successfully!", categories})
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server error!" })
    }
}

exports.getAllCategoriesForAdmin = async (req, res) => {
    try{
        const categories = await Category.find()
        if(categories.length < 1){
            res.status(400).json({ success: false, message: "Categories not found!"})
        }

        res.status(200).json({ success: true, message: "Categories fetched successfully!", categories})
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server error!" })
    }
}

exports.createCategory = async (req, res) => {
    try{
        const { title, description, imageUrl } = req.body

        const { error } = createCategorySchema.validate({ title, description, imageUrl })
        if(error){
            res.status(400).json({ success: false, message: "Invalid Input!"})
        }

        const newCategory = new Category({
            title,
            description,
            imageUrl
        })

        await newCategory.save()

        res.status(201).json({ success: true, message: "Category created successfully!", category: newCategory})
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server error!" })
    }
}

exports.updateCategory = async (req, res) => {
    try{
        const categoryId = req.params.id

        const { error } = updateCategorySchema.validate(req.body)
        if(error){
            res.status(400).json({ success: false, message: "Invalid Input!"})
        }

        const category = await Category.findById(categoryId)
        if(!category){
            res.status(404).json({ success: false, message: "Category ID not found!"})
        }

        const updatedCategory = await Category.findByIdAndUpdate(categoryId, req.body, { new: true })

        res.status(200).json({ success: true, message: "Category updated successfully!", updatedCategory})
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server error!" })
    }
}

exports.deleteCategory = async (req, res) => {
    try{
        const categoryId = req.params.id

        const category = await Category.findById(categoryId)
        if(!category){
            res.status(404).json({ success: false, message: "Category ID not found!"})
        }

        await Category.findByIdAndDelete(categoryId)

        res.status(200).json({ success: true, message: "Category deleted successfully!"})
    }catch(err){
        res.status(500).json({ success: false, message: "Internal Server error!" })
    }
}