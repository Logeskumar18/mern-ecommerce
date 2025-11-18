import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// =========================
// GET USER CART
// =========================
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: 'items.product',
        populate: {
          path: 'category categories',
          select: 'name'
        }
      });

    if (!cart) {
      return res.json({
        success: true,
        cart: {
          items: [],
          totalPrice: 0,
          itemCount: 0
        }
      });
    }

    // Filter out items where product no longer exists
    const validItems = cart.items.filter(item => item.product);
    
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      cart.totalPrice = calculateCartTotal(validItems);
      await cart.save();
    }

    res.json({
      success: true,
      cart: {
        _id: cart._id,
        items: validItems,
        totalPrice: cart.totalPrice,
        itemCount: validItems.reduce((total, item) => total + item.quantity, 0),
        lastUpdated: cart.lastUpdated
      }
    });
  } catch (error) {
    console.error("Get Cart Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// ADD TO CART
// =========================
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, variations = [] } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Only ${product.stock} items available in stock` 
      });
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Calculate price with variations
    let itemPrice = product.price;
    if (product.discount > 0) {
      itemPrice = itemPrice * (1 - product.discount / 100);
    }
    
    variations.forEach(variation => {
      if (variation.option && variation.option.priceAdjustment) {
        itemPrice += variation.option.priceAdjustment;
      }
    });

    // Check if item with same product and variations already exists
    const existingItemIndex = cart.items.findIndex(item => 
      item.product.toString() === productId && 
      JSON.stringify(item.variations) === JSON.stringify(variations)
    );

    if (existingItemIndex > -1) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity;
      
      // Check stock limit
      if (cart.items[existingItemIndex].quantity > product.stock) {
        cart.items[existingItemIndex].quantity = product.stock;
      }
    } else {
      // Add new item
      cart.items.push({
        product: productId,
        quantity,
        variations,
        priceAtTime: Math.round(itemPrice)
      });
    }

    cart.totalPrice = calculateCartTotal(cart.items);
    await cart.save();

    await cart.populate({
      path: 'items.product',
      populate: {
        path: 'category categories',
        select: 'name'
      }
    });

    res.json({
      success: true,
      message: "Item added to cart",
      cart: {
        items: cart.items,
        totalPrice: cart.totalPrice,
        itemCount: cart.items.reduce((total, item) => total + item.quantity, 0)
      }
    });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// UPDATE CART ITEM
// =========================
export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: "Item not found in cart" });
    }

    if (quantity <= 0) {
      // Remove item
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      const product = await Product.findById(cart.items[itemIndex].product);
      if (!product) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = Math.min(quantity, product.stock);
      }
    }

    cart.totalPrice = calculateCartTotal(cart.items);
    await cart.save();

    await cart.populate({
      path: 'items.product',
      populate: {
        path: 'category categories',
        select: 'name'
      }
    });

    res.json({
      success: true,
      message: "Cart updated",
      cart: {
        items: cart.items,
        totalPrice: cart.totalPrice,
        itemCount: cart.items.reduce((total, item) => total + item.quantity, 0)
      }
    });
  } catch (error) {
    console.error("Update Cart Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// REMOVE FROM CART
// =========================
export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);
    cart.totalPrice = calculateCartTotal(cart.items);
    await cart.save();

    await cart.populate({
      path: 'items.product',
      populate: {
        path: 'category categories',
        select: 'name'
      }
    });

    res.json({
      success: true,
      message: "Item removed from cart",
      cart: {
        items: cart.items,
        totalPrice: cart.totalPrice,
        itemCount: cart.items.reduce((total, item) => total + item.quantity, 0)
      }
    });
  } catch (error) {
    console.error("Remove from Cart Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// CLEAR CART
// =========================
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    
    if (cart) {
      cart.items = [];
      cart.totalPrice = 0;
      await cart.save();
    }

    res.json({
      success: true,
      message: "Cart cleared",
      cart: {
        items: [],
        totalPrice: 0,
        itemCount: 0
      }
    });
  } catch (error) {
    console.error("Clear Cart Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// SYNC CART (Merge local cart with server cart)
// =========================
export const syncCart = async (req, res) => {
  try {
    const { localCartItems = [] } = req.body;

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Merge local cart items with server cart
    for (const localItem of localCartItems) {
      const product = await Product.findById(localItem._id || localItem.product);
      if (!product || product.stock === 0) continue;

      const existingItemIndex = cart.items.findIndex(item => 
        item.product.toString() === product._id.toString() &&
        JSON.stringify(item.variations || []) === JSON.stringify(localItem.variations || [])
      );

      let itemPrice = product.price;
      if (product.discount > 0) {
        itemPrice = itemPrice * (1 - product.discount / 100);
      }

      if (existingItemIndex > -1) {
        // Merge quantities
        cart.items[existingItemIndex].quantity = Math.min(
          cart.items[existingItemIndex].quantity + (localItem.quantity || 1),
          product.stock
        );
      } else {
        // Add new item
        cart.items.push({
          product: product._id,
          quantity: Math.min(localItem.quantity || 1, product.stock),
          variations: localItem.variations || [],
          priceAtTime: Math.round(itemPrice)
        });
      }
    }

    cart.totalPrice = calculateCartTotal(cart.items);
    await cart.save();

    await cart.populate({
      path: 'items.product',
      populate: {
        path: 'category categories',
        select: 'name'
      }
    });

    res.json({
      success: true,
      message: "Cart synced successfully",
      cart: {
        items: cart.items,
        totalPrice: cart.totalPrice,
        itemCount: cart.items.reduce((total, item) => total + item.quantity, 0)
      }
    });
  } catch (error) {
    console.error("Sync Cart Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// =========================
// HELPER FUNCTIONS
// =========================
const calculateCartTotal = (items) => {
  return items.reduce((total, item) => {
    return total + (item.priceAtTime * item.quantity);
  }, 0);
};
