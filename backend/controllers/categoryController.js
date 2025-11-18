import Category from "../models/Category.js";
import Product from "../models/Product.js";

export const createCategory = async (req, res) => {
  try {
    const { name, description, image, parentCategory } = req.body;
    const category = await Category.create({ 
      name, 
      description, 
      image,
      parentCategory: parentCategory || null 
    });
    
    await category.populate('parentCategory', 'name');
    res.status(201).json(category);
  } catch (err) {
    // Check for MongoDB Duplicate Key Error (Code 11000)
    if (err.code === 11000) {
      // 400 Bad Request - Client tried to insert a duplicate value
      return res.status(400).json({ 
        message: `Category with name '${req.body.name}' already exists.`,
        error: err.message
      });
    }
    
    // For all other errors (validation failure, server error, etc.)
    res.status(500).json({ message: err.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const { includeInactive } = req.query;
    const filter = includeInactive === 'true' ? {} : { isActive: true };
    
    const categories = await Category.find(filter)
      .populate('parentCategory', 'name')
      .sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id)
      .populate('parentCategory', 'name slug');
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug, isActive: true })
      .populate('parentCategory', 'name slug');
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubcategories = async (req, res) => {
  try {
    const { id } = req.params;
    const subcategories = await Category.find({ 
      parentCategory: id, 
      isActive: true 
    }).sort({ name: 1 });
    
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image, parentCategory, isActive } = req.body;
    
    const category = await Category.findByIdAndUpdate(
      id,
      { name, description, image, parentCategory, isActive },
      { new: true, runValidators: true }
    ).populate('parentCategory', 'name');
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.json(category);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: `Category with name '${req.body.name}' already exists.`
      });
    }
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category has products
    const productsCount = await Product.countDocuments({
      $or: [
        { category: id },
        { categories: id }
      ]
    });
    
    if (productsCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. ${productsCount} products are associated with this category.`
      });
    }
    
    // Check if category has subcategories
    const subcategoriesCount = await Category.countDocuments({ parentCategory: id });
    if (subcategoriesCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It has ${subcategoriesCount} subcategories.`
      });
    }
    
    const category = await Category.findByIdAndDelete(id);
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    category.isActive = !category.isActive;
    await category.save();
    
    await category.populate('parentCategory', 'name');
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategoriesWithProductCount = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          let: { categoryId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$category', '$$categoryId'] },
                    { $in: ['$$categoryId', '$categories'] }
                  ]
                }
              }
            }
          ],
          as: 'products'
        }
      },
      {
        $addFields: {
          productCount: { $size: '$products' }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'parentCategory',
          foreignField: '_id',
          as: 'parentCategory'
        }
      },
      {
        $addFields: {
          parentCategory: { $arrayElemAt: ['$parentCategory', 0] }
        }
      },
      {
        $sort: { name: 1 }
      }
    ]);
    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
