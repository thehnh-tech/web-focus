import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const offerSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    category: {
      type: String,
      enum: ["Compression Tops", "Sets", "Accessories"],
      required: true
    },
    image: { type: String, required: true },
    secondaryImage: { type: String },
    alt: { type: String, required: true },
    color: { type: String },
    description: { type: String, required: true },
    featured: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const orderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    slug: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    color: { type: String },
    size: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, required: true },
    address: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    size: { type: String, enum: ["S", "M", "L"], required: true },
    items: { type: [orderItemSchema], default: [] },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true, default: 7 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, default: "Cash on Delivery" },
    status: {
      type: String,
      enum: ["new", "confirmed", "delivered", "cancelled"],
      default: "new"
    }
  },
  { timestamps: true }
);

export type OfferDocument = InferSchemaType<typeof offerSchema> & {
  _id: mongoose.Types.ObjectId;
};

export type OrderDocument = InferSchemaType<typeof orderSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
};

export const OfferModel =
  (mongoose.models.Offer as Model<OfferDocument>) ||
  mongoose.model<OfferDocument>("Offer", offerSchema);

export const OrderModel =
  (mongoose.models.Order as Model<OrderDocument>) ||
  mongoose.model<OrderDocument>("Order", orderSchema);
