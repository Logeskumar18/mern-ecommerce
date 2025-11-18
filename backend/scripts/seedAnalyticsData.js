import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

dotenv.config();

const seedAnalyticsData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding analytics data');

    // Get existing products and users
    const products = await Product.find().limit(5);
    const users = await User.find({ role: 'customer' }).limit(3);

    if (products.length === 0 || users.length === 0) {
      console.log('Need products and users to create sample orders');
      return;
    }

    // Delete existing orders (optional - for fresh data)
    // await Order.deleteMany({});

    // Create sample orders for the last 30 days
    const orders = [];
    const statuses = ['Processing', 'Shipped', 'Delivered', 'Pending'];

    for (let i = 0; i < 20; i++) {
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));

      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const quantity = Math.floor(Math.random() * 5) + 1;
      const price = randomProduct.price;

      orders.push({
        user: randomUser._id,
        items: [{
          product: randomProduct._id,
          quantity: quantity,
          price: price
        }],
        totalAmount: price * quantity,
        orderStatus: statuses[Math.floor(Math.random() * statuses.length)],
        paymentStatus: 'Completed',
        paymentMethod: 'Online',
        shippingAddress: {
          fullName: randomUser.name,
          address: '123 Sample Street',
          city: 'Sample City',
          postalCode: '12345',
          country: 'India',
          phone: '+91 9876543210'
        },
        createdAt: randomDate
      });
    }

    await Order.insertMany(orders);
    console.log(`✅ Created ${orders.length} sample orders for analytics`);

    console.log('🎉 Analytics seed data created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding analytics data:', error);
    process.exit(1);
  }
};

seedAnalyticsData();