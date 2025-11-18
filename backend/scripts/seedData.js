import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

dotenv.config();

// Categories to seed
const categories = [
  {
    name: "Electronics",
    description: "Latest electronic gadgets and accessories"
  },
  {
    name: "Fashion",
    description: "Trendy clothing and accessories for all"
  },
  {
    name: "Home & Garden",
    description: "Everything for your home and garden needs"
  },
  {
    name: "Sports & Fitness",
    description: "Sports equipment and fitness gear"
  },
  {
    name: "Books & Media",
    description: "Books, magazines, and digital media"
  },
  {
    name: "Health & Beauty",
    description: "Personal care and beauty products"
  },
  {
    name: "Toys & Games",
    description: "Fun toys and games for all ages"
  },
  {
    name: "Automotive",
    description: "Car accessories and automotive tools"
  }
];

// Products to seed (will be linked to categories)
const products = [
  // Electronics
  {
    name: "iPhone 15 Pro",
    description: "Latest Apple iPhone with advanced camera system and A17 Pro chip",
    price: 99999,
    stock: 50,
    discount: 5,
    isFeatured: true,
    category: "Electronics",
    images: ["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=400&fit=crop"]
  },
  {
    name: "Samsung Galaxy S24",
    description: "Flagship Android smartphone with AI features",
    price: 79999,
    stock: 45,
    discount: 10,
    isFeatured: true,
    category: "Electronics",
    images: ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=400&fit=crop"]
  },
  {
    name: "MacBook Pro 16-inch",
    description: "Professional laptop with M3 Max chip for creators",
    price: 249999,
    stock: 20,
    discount: 0,
    isFeatured: true,
    category: "Electronics",
    images: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=400&fit=crop"]
  },
  {
    name: "Sony WH-1000XM5",
    description: "Industry-leading noise canceling wireless headphones",
    price: 29999,
    stock: 75,
    discount: 15,
    category: "Electronics",
    images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=400&fit=crop"]
  },
  {
    name: "iPad Air",
    description: "Powerful tablet for creativity and productivity",
    price: 59999,
    stock: 30,
    discount: 8,
    category: "Electronics",
    images: ["https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500&h=400&fit=crop"]
  },

  // Fashion
  {
    name: "Nike Air Jordan 1",
    description: "Classic basketball sneakers with iconic design",
    price: 12999,
    stock: 100,
    discount: 0,
    isFeatured: true,
    category: "Fashion",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=400&fit=crop"]
  },
  {
    name: "Levi's 501 Original Jeans",
    description: "Classic straight-fit jeans with authentic details",
    price: 4999,
    stock: 80,
    discount: 20,
    category: "Fashion",
    images: ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=400&fit=crop"]
  },
  {
    name: "Adidas Ultraboost 22",
    description: "Running shoes with responsive cushioning",
    price: 17999,
    stock: 60,
    discount: 12,
    category: "Fashion",
    images: ["https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&h=400&fit=crop"]
  },
  {
    name: "H&M Cotton T-Shirt",
    description: "Basic cotton t-shirt in multiple colors",
    price: 799,
    stock: 200,
    discount: 25,
    category: "Fashion",
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=400&fit=crop"]
  },

  // Home & Garden
  {
    name: "Dyson V15 Detect",
    description: "Powerful cordless vacuum with laser dust detection",
    price: 65999,
    stock: 25,
    discount: 10,
    isFeatured: true,
    category: "Home & Garden",
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=400&fit=crop"]
  },
  {
    name: "IKEA MALM Bed Frame",
    description: "Modern bed frame with clean lines and storage",
    price: 15999,
    stock: 15,
    discount: 0,
    category: "Home & Garden",
    images: ["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=400&fit=crop"]
  },
  {
    name: "Instant Pot Duo 7-in-1",
    description: "Multi-use pressure cooker for quick meals",
    price: 8999,
    stock: 40,
    discount: 30,
    category: "Home & Garden",
    images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=400&fit=crop"]
  },

  // Sports & Fitness
  {
    name: "Yoga Mat Pro",
    description: "Non-slip yoga mat with superior grip and cushioning",
    price: 2999,
    stock: 150,
    discount: 15,
    category: "Sports & Fitness",
    images: ["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&h=400&fit=crop"]
  },
  {
    name: "Adjustable Dumbbells Set",
    description: "Space-saving adjustable dumbbells 5-50lbs",
    price: 24999,
    stock: 20,
    discount: 0,
    isFeatured: true,
    category: "Sports & Fitness",
    images: ["https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=400&fit=crop"]
  },
  {
    name: "Resistance Bands Set",
    description: "Complete resistance training system with multiple bands",
    price: 1999,
    stock: 75,
    discount: 25,
    category: "Sports & Fitness",
    images: ["https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500&h=400&fit=crop"]
  },

  // Books & Media
  {
    name: "The Psychology of Money",
    description: "Bestselling book about wealth, greed, and happiness",
    price: 599,
    stock: 100,
    discount: 10,
    category: "Books & Media",
    images: ["https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=400&fit=crop"]
  },
  {
    name: "Atomic Habits",
    description: "An easy & proven way to build good habits & break bad ones",
    price: 749,
    stock: 85,
    discount: 15,
    category: "Books & Media",
    images: ["https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=400&fit=crop"]
  },

  // Health & Beauty
  {
    name: "The Ordinary Niacinamide 10%",
    description: "High-strength vitamin and zinc blemish formula",
    price: 899,
    stock: 200,
    discount: 0,
    category: "Health & Beauty",
    images: ["https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=400&fit=crop"]
  },
  {
    name: "Cetaphil Gentle Cleanser",
    description: "Mild, non-irritating cleanser for all skin types",
    price: 1299,
    stock: 120,
    discount: 20,
    category: "Health & Beauty",
    images: ["https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500&h=400&fit=crop"]
  },

  // Toys & Games
  {
    name: "LEGO Creator Expert Set",
    description: "Advanced building set for teens and adults",
    price: 8999,
    stock: 30,
    discount: 0,
    category: "Toys & Games",
    images: ["https://images.unsplash.com/photo-1558877385-09f4d4ac96c2?w=500&h=400&fit=crop"]
  },
  {
    name: "Nintendo Switch OLED",
    description: "Gaming console with vibrant OLED screen",
    price: 34999,
    stock: 25,
    discount: 5,
    isFeatured: true,
    category: "Toys & Games",
    images: ["https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&h=400&fit=crop"]
  },

  // Automotive
  {
    name: "Car Phone Mount",
    description: "Magnetic wireless charging car mount",
    price: 2499,
    stock: 80,
    discount: 30,
    category: "Automotive",
    images: ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&h=400&fit=crop"]
  },
  {
    name: "Car Dash Cam",
    description: "1080p HD dashboard camera with night vision",
    price: 7999,
    stock: 40,
    discount: 15,
    category: "Automotive",
    images: ["https://images.unsplash.com/photo-1544373850-76a95e4a2b75?w=500&h=400&fit=crop"]
  }
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected for seeding");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log("Clearing existing categories and products...");
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Seed categories
    console.log("Seeding categories...");
    const seededCategories = await Category.insertMany(categories);
    console.log(`✅ ${seededCategories.length} categories created`);

    // Create a map of category names to IDs
    const categoryMap = {};
    seededCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Prepare products with correct category IDs
    const productsWithCategories = products.map(product => ({
      ...product,
      category: categoryMap[product.category]
    }));

    // Seed products
    console.log("Seeding products...");
    const seededProducts = await Product.insertMany(productsWithCategories);
    console.log(`✅ ${seededProducts.length} products created`);

    // Summary
    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`- Categories: ${seededCategories.length}`);
    console.log(`- Products: ${seededProducts.length}`);
    
    // Show products by category
    console.log("\n📝 Products by Category:");
    for (const category of seededCategories) {
      const count = seededProducts.filter(p => p.category.toString() === category._id.toString()).length;
      console.log(`- ${category.name}: ${count} products`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
};

// Run the seeding
seedDatabase();