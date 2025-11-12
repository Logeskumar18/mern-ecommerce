import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const images = req.files?.map(file => file.path) || [];
    const product = await Product.create({ name, description, price, category, stock, images });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProducts = async (req, res) => {
  const products = await Product.find().populate("category");
  res.json(products);
};

export const updateProduct = async (req, res) => {
  try {
    const data = {
      ...req.body,
      price: req.body.price ? Number(req.body.price) : undefined,
      stock: req.body.stock ? Number(req.body.stock) : undefined,
    };

    if (req.files?.length) {
      data.images = req.files.map(file => file.path);
    }

    const product = await Product.findByIdAndUpdate(req.params.id, data, { new: true });

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



export const deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
};
