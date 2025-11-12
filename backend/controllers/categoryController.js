import Category from "../models/Category.js";

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await Category.create({ name, description });
    res.status(201).json(category);
  } catch (err) {
    // Check for MongoDB Duplicate Key Error (Code 11000)
    if (err.code === 11000) {
      // 400 Bad Request - Client tried to insert a duplicate value
      return res.status(400).json({ 
        message: `Category with name '${name}' already exists.`,
        error: err.message
      });
    }
    
    // For all other errors (validation failure, server error, etc.)
    res.status(500).json({ message: err.message });
  }
};

export const getCategories = async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
};
