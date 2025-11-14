import mongoose from 'mongoose';
const { Schema } = mongoose;

// Localized schema for multilingual names/descriptions
const localizedSchema = new Schema({
  en: { type: String, required: true },
  ar: { type: String, required: true },
}, { _id: false });

// --- Main Product Schema ---
const productSchema = new Schema({
  // Basic product info
  name: { type: localizedSchema, required: true },
  description: { type: localizedSchema, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },

  // Relation to subcategory/shop
  subcategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', required: true },

  // Type: single item or combo/meal
  producttype: {
    type: String,
    enum: ['item', 'meal'], // "item" for individual products, "meal" for combos
    default: 'item',
  },

  // Only used if productType === 'meal'
  mealComponents: [
    {
      category: {
        type: String,
        enum: ['main', 'side', 'drink', 'extra'], // flexible grouping
        required: true,
      },
      // References to other products from the same collection
      products: [ { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, }, ],
      quantity: { type: Number, default: 1 },
      notes: { type: String, default: '' }, // optional extra info
    },
  ],

  overprice: { type: Number, required: true },

  // Flags and timestamps
  featured: { type: Boolean, default: false },
  topselling: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;






/*
import mongoose from 'mongoose';

const { Schema } = mongoose;

// Schema for localized fields (e.g., English and Arabic)
const localizedSchema = new Schema({
  en: { type: String, required: true },
  ar: { type: String, required: true },
}, { _id: false });

// Schema for Item Of The Meal
const mealItemSchema = new Schema({
  optionName: { type: localizedSchema, required: true },
  optionPrice: { type: Number, required: true },
  optionDescription: { type: localizedSchema, required: true },
  optionImage: { type: String, default: '' },
}, { _id: false });


// Main Product schema
const productSchema = new Schema({
  name: { type: localizedSchema, required: true },
  description: { type: localizedSchema, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  subcategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', required: true },
  featured: { type: Boolean, default: false },
  topselling: { type: Boolean, default: false },
  mealitem1option1: { type: [mealItemSchema], default: [] },
  mealitem1option1Number: { type: Number, default: 1 },
  mealitem1option2: { type: [mealItemSchema], default: [] },
  mealitem1option2Number: { type: Number, default: 1 },
  mealsideitem: { type: [mealItemSchema], default: [] },
  mealsideitemNumber: { type: Number, default: 1 },
  mealbeverageitem: { type: [mealItemSchema], default: [] },
  mealbeverageitemNumber: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
*/