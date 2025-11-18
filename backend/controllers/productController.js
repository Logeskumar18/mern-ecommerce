import Product from "../models/Product.js";
import Review from "../models/Review.js";
import Wishlist from "../models/Wishlist.js";
import Order from "../models/Order.js";
import mongoose from "mongoose";

// =========================
// CREATE PRODUCT
// =========================
export const createProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      category, 
      categories, 
      stock, 
      discount, 
      isFeatured, 
      brand, 
      tags, 
      variations 
    } = req.body;

    // Get file paths from uploaded images and convert to URL format
    const images = req.files?.map(file => file.path.replace(/\\/g, '/')) || [];

    // Validate and parse numeric fields
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock) || 0;
    const parsedDiscount = discount === '' || discount === undefined || discount === null ? 0 : parseFloat(discount);
    
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ success: false, message: "Invalid price value" });
    }
    
    if (isNaN(parsedDiscount) || parsedDiscount < 0 || parsedDiscount > 100) {
      return res.status(400).json({ success: false, message: "Invalid discount value (0-100%)" });
    }

    // Handle multiple categories
    let productCategories = [];
    if (categories) {
      productCategories = typeof categories === 'string' 
        ? JSON.parse(categories).filter(cat => cat.trim() !== '') 
        : categories.filter(cat => cat.trim() !== '');
    }

    // Handle tags
    let productTags = [];
    if (tags) {
      productTags = typeof tags === 'string'
        ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : tags;
    }

    // Handle variations
    let productVariations = [];
    if (variations) {
      productVariations = typeof variations === 'string'
        ? JSON.parse(variations)
        : variations;
    }

    // Generate slug from name
    const slug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const product = await Product.create({
      name,
      description,
      price: parsedPrice,
      category,
      categories: productCategories,
      stock: parsedStock,
      discount: parsedDiscount,
      isFeatured: isFeatured === 'true',
      brand: brand || 'Unknown',
      tags: productTags,
      variations: productVariations,
      slug: slug + '-' + Date.now(), // Ensure uniqueness
      images,
    });

    const populatedProduct = await Product.findById(product._id)
      .populate("category")
      .populate("categories");

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: populatedProduct,
    });
  } catch (error) {
    console.error("Create Product Error:", error);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

// =========================
// GET PRODUCTS BY CATEGORY
// =========================
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const products = await Product.find({ category: categoryId }).populate("category");

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get Products by Category Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// GET ALL PRODUCTS
// =========================
export const getProducts = async (req, res) => {
  try {
    const { 
      category, 
      categories, 
      search, 
      featured, 
      minPrice, 
      maxPrice, 
      brand, 
      brands,
      minRating,
      inStock,
      tags,
      sort, 
      page = 1, 
      limit = 12 
    } = req.query;
    
    // Build filter object
    let filter = {};
    
    // Active products only
    filter.isActive = true;
    
    // Single category filter (backward compatibility)
    if (category) {
      filter.$or = [
        { category: category },
        { categories: { $in: [category] } }
      ];
    }
    
    // Multiple categories filter
    if (categories) {
      const categoryArray = categories.split(',').filter(cat => cat.trim() !== '');
      if (categoryArray.length > 0) {
        filter.$or = [
          { category: { $in: categoryArray } },
          { categories: { $in: categoryArray } }
        ];
      }
    }
    
    // Search filter - enhanced to include brand and tags
    if (search) {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ]
      });
    }
    
    // Featured filter
    if (featured === 'true') {
      filter.isFeatured = true;
    }
    
    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }
    
    // Brand filter
    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' };
    }
    
    // Multiple brands filter
    if (brands) {
      const brandArray = brands.split(',').filter(b => b.trim() !== '');
      if (brandArray.length > 0) {
        filter.brand = { $in: brandArray.map(b => new RegExp(b, 'i')) };
      }
    }
    
    // Rating filter
    if (minRating) {
      filter['ratings.average'] = { $gte: parseFloat(minRating) };
    }
    
    // Stock filter
    if (inStock === 'true') {
      filter.stock = { $gt: 0 };
    } else if (inStock === 'false') {
      filter.stock = { $lte: 0 };
    }
    
    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').filter(tag => tag.trim() !== '');
      if (tagArray.length > 0) {
        filter.tags = { $in: tagArray };
      }
    }

    // Sorting
    let sortOption = {};
    if (sort) {
      switch (sort) {
        case 'price_asc':
          sortOption = { price: 1 };
          break;
        case 'price_desc':
          sortOption = { price: -1 };
          break;
        case 'name_asc':
          sortOption = { name: 1 };
          break;
        case 'name_desc':
          sortOption = { name: -1 };
          break;
        case 'rating_desc':
          sortOption = { 'ratings.average': -1, 'ratings.count': -1 };
          break;
        case 'rating_asc':
          sortOption = { 'ratings.average': 1, 'ratings.count': 1 };
          break;
        case 'popularity':
          sortOption = { sales: -1, views: -1 };
          break;
        case 'newest':
          sortOption = { createdAt: -1 };
          break;
        case 'oldest':
          sortOption = { createdAt: 1 };
          break;
        case 'featured':
          sortOption = { isFeatured: -1, createdAt: -1 };
          break;
        default:
          sortOption = { createdAt: -1 };
      }
    } else {
      sortOption = { createdAt: -1 };
    }

    // Pagination
    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    // Get total count for pagination
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limitNumber);

    const products = await Product.find(filter)
      .populate("category")
      .populate("categories")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber);

    // Get available brands for filtering
    const availableBrands = await Product.distinct('brand', { isActive: true });
    const availableTags = await Product.distinct('tags', { isActive: true });
    
    // Get price range
    const priceRange = await Product.aggregate([
      { $match: { isActive: true } },
      { 
        $group: {
          _id: null,
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" }
        }
      }
    ]);

    res.json({
      success: true,
      count: products.length,
      totalProducts,
      totalPages,
      currentPage: pageNumber,
      hasNextPage: pageNumber < totalPages,
      hasPrevPage: pageNumber > 1,
      products,
      filters: {
        availableBrands: availableBrands.filter(brand => brand && brand !== 'Unknown'),
        availableTags: availableTags.filter(tag => tag),
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 10000 }
      }
    });
  } catch (error) {
    console.error("Get Products Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// GET SINGLE PRODUCT
// =========================
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get Product by ID Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// UPDATE PRODUCT
// =========================
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, discount, isFeatured } = req.body;

    let product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    // If new images uploaded, replace old ones
    const newImages = req.files?.map(file => file.path.replace(/\\/g, '/'));
    if (newImages && newImages.length > 0) {
      product.images = newImages;
    }

    product.name = name || product.name;
    product.description = description || product.description;
    
    // Handle numeric fields with proper validation
    if (price !== undefined && price !== '') {
      const parsedPrice = parseFloat(price);
      product.price = isNaN(parsedPrice) ? product.price : parsedPrice;
    }
    
    product.category = category || product.category;
    
    if (stock !== undefined && stock !== '') {
      const parsedStock = parseInt(stock);
      product.stock = isNaN(parsedStock) ? product.stock : parsedStock;
    }
    
    if (discount !== undefined) {
      const parsedDiscount = discount === '' || discount === null ? 0 : parseFloat(discount);
      product.discount = isNaN(parsedDiscount) ? 0 : parsedDiscount;
    }
    
    product.isFeatured = isFeatured !== undefined ? (isFeatured === 'true') : product.isFeatured;

    await product.save();

    const updatedProduct = await Product.findById(product._id).populate("category");

    res.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Update Product Error:", error);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

// =========================
// DELETE PRODUCT
// =========================
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    await product.deleteOne();

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete Product Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// ADD PRODUCT REVIEW
// =========================
export const addProductReview = async (req, res) => {
  try {
    const { productId, orderId, rating, title, comment } = req.body;
    const userId = req.user.id;

    // Verify user has purchased this product
    const order = await Order.findOne({ 
      _id: orderId, 
      user: userId, 
      'items.product': productId,
      orderStatus: 'Delivered' 
    });

    if (!order) {
      return res.status(400).json({ 
        success: false, 
        message: "You can only review products you have purchased and received" 
      });
    }

    // Check if user already reviewed this product for this order
    const existingReview = await Review.findOne({ 
      user: userId, 
      product: productId, 
      order: orderId 
    });

    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: "You have already reviewed this product" 
      });
    }

    // Create review
    const review = await Review.create({
      user: userId,
      product: productId,
      order: orderId,
      rating: parseInt(rating),
      title: title.trim(),
      comment: comment.trim(),
    });

    // Update product ratings
    await updateProductRatings(productId);

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name email')
      .populate('product', 'name');

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Add Review Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// GET PRODUCT REVIEWS
// =========================
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;

    let sortOption = {};
    switch (sort) {
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
      case 'oldest':
        sortOption = { createdAt: 1 };
        break;
      case 'rating_high':
        sortOption = { rating: -1, createdAt: -1 };
        break;
      case 'rating_low':
        sortOption = { rating: 1, createdAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const totalReviews = await Review.countDocuments({ product: productId });
    const totalPages = Math.ceil(totalReviews / limitNumber);

    const reviews = await Review.find({ product: productId })
      .populate('user', 'name email')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber);

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { product: mongoose.Types.ObjectId(productId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    res.json({
      success: true,
      reviews,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalReviews,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      },
      ratingDistribution,
    });
  } catch (error) {
    console.error("Get Reviews Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// WISHLIST OPERATIONS
// =========================
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
    }

    // Check if product already in wishlist
    const existingItem = wishlist.products.find(item => 
      item.product.toString() === productId
    );

    if (existingItem) {
      return res.status(400).json({ 
        success: false, 
        message: "Product already in wishlist" 
      });
    }

    wishlist.products.push({ product: productId });
    await wishlist.save();

    res.json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    console.error("Add to Wishlist Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const wishlist = await Wishlist.findOne({ user: userId });
    
    if (!wishlist) {
      return res.status(404).json({ success: false, message: "Wishlist not found" });
    }

    wishlist.products = wishlist.products.filter(item => 
      item.product.toString() !== productId
    );
    
    await wishlist.save();

    res.json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("Remove from Wishlist Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    const wishlist = await Wishlist.findOne({ user: userId })
      .populate({
        path: 'products.product',
        populate: {
          path: 'category categories',
          select: 'name'
        }
      });

    if (!wishlist) {
      return res.json({
        success: true,
        products: [],
        count: 0,
      });
    }

    res.json({
      success: true,
      products: wishlist.products,
      count: wishlist.products.length,
    });
  } catch (error) {
    console.error("Get Wishlist Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// RELATED PRODUCTS
// =========================
export const getRelatedProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 6 } = req.query;

    const product = await Product.findById(productId).populate('categories');
    
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Get related products based on categories, brand, and tags
    const filter = {
      _id: { $ne: productId },
      isActive: true,
      $or: []
    };

    // Same categories
    if (product.categories && product.categories.length > 0) {
      filter.$or.push({ categories: { $in: product.categories.map(cat => cat._id) } });
    }
    
    // Same brand
    if (product.brand && product.brand !== 'Unknown') {
      filter.$or.push({ brand: product.brand });
    }
    
    // Same tags
    if (product.tags && product.tags.length > 0) {
      filter.$or.push({ tags: { $in: product.tags } });
    }

    // If no criteria found, use same main category
    if (filter.$or.length === 0 && product.category) {
      filter.category = product.category;
      delete filter.$or;
    }

    const relatedProducts = await Product.find(filter)
      .populate('category categories')
      .limit(parseInt(limit))
      .sort({ sales: -1, 'ratings.average': -1 });

    res.json({
      success: true,
      products: relatedProducts,
      count: relatedProducts.length,
    });
  } catch (error) {
    console.error("Get Related Products Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// TRACK PRODUCT VIEW
// =========================
export const trackProductView = async (req, res) => {
  try {
    const { productId } = req.params;
    
    await Product.findByIdAndUpdate(productId, { $inc: { views: 1 } });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Track View Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// HELPER FUNCTIONS
// =========================
const updateProductRatings = async (productId) => {
  try {
    const reviews = await Review.find({ product: productId });
    
    if (reviews.length === 0) {
      await Product.findByIdAndUpdate(productId, {
        'ratings.average': 0,
        'ratings.count': 0
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Product.findByIdAndUpdate(productId, {
      'ratings.average': Math.round(averageRating * 10) / 10, // Round to 1 decimal
      'ratings.count': reviews.length
    });
  } catch (error) {
    console.error("Update Ratings Error:", error);
  }
};
