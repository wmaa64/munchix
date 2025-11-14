import mongoose from "mongoose";
import { displayName } from "react-world-flags";

const selectedItemSchema = new mongoose.Schema({
  name: {
    en: { type: String },
    ar: { type: String }
  },
  quantity: { type: Number },
  price: { type: Number },
  image: { type: String },
});

const categorySchema = new mongoose.Schema({
  category: { type: String },
  selectedItems: [selectedItemSchema], // items chosen in this category
});

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
  },
  displayName: { type: String }, // ✅ NEW FIELD for readable meal summary
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  image: { type: String, required: true },
  selectedCategories: [categorySchema], // 👈 new field for meal combos
});

const orderSchema = new mongoose.Schema({
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  items: [orderItemSchema],
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, default: "paid" },
  orderStatus: { type: String, default: "Pending" },
  paymentIntentId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;





/*
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      name: {
        en: { type: String, required: true },
        ar: { type: String, required: true },
      },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      image: { type: String, required: true },
    },
  ],
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, default: "payed" },
  orderStatus: { type: String, default: "Pending" },
  paymentIntentId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
*/