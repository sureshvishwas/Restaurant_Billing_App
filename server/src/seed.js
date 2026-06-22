require("dotenv").config();
const connectDB = require("./config/db");
const MenuItem = require("./models/MenuItem");
const PaymentSetting = require("./models/PaymentSetting");

const sampleItems = [
  { name: "Classic Burger", price: 9.99, taxRate: 8, category: "Mains", image: "" },
  { name: "Margherita Pizza", price: 12.5, taxRate: 8, category: "Mains", image: "" },
  { name: "Caesar Salad", price: 7.75, taxRate: 6, category: "Starters", image: "" },
  { name: "Tomato Soup", price: 5.25, taxRate: 6, category: "Starters", image: "" },
  { name: "Iced Lemon Tea", price: 3.5, taxRate: 3, category: "Drinks", image: "" },
  { name: "Chocolate Brownie", price: 4.75, taxRate: 5, category: "Desserts", image: "" }
];

const seed = async () => {
  await connectDB();
  await MenuItem.deleteMany();
  await MenuItem.insertMany(sampleItems);
  await PaymentSetting.createDefault();
  console.log("Seeded menu items and payment settings");
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
