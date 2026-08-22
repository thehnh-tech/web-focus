import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const settingsSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: "shop" },
    deliveryFee: { type: Number, required: true, default: 0, min: 0 }
  },
  { timestamps: true }
);

const categorySchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

const offerSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    oldPrice: { type: Number },
    category: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    secondaryImage: { type: String },
    alt: { type: String, required: true },
    color: { type: String },
    description: { type: String, required: true },
    featured: { type: Boolean, default: true },
    soldOutSizes: { type: [String], default: [] }
  },
  { timestamps: true }
);

const promoCodeSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true, min: 0 },
    minSubtotal: { type: Number, default: 0, min: 0 },
    maxUses: { type: Number, default: null, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    expiresAt: { type: Date, default: null },
    active: { type: Boolean, default: true }
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
    email: { type: String, trim: true, lowercase: true },
    size: { type: String, enum: ["S", "M", "L"], required: true },
    items: { type: [orderItemSchema], default: [] },
    subtotal: { type: Number, required: true },
    deliveryFee: { type: Number, required: true, default: 0 },
    promoCode: { type: String, trim: true, uppercase: true, default: null },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, default: "Paiement à la livraison" },
    status: {
      type: String,
      enum: ["new", "confirmed", "delivered", "cancelled"],
      default: "new"
    }
  },
  { timestamps: true }
);

export type SettingsDocument = InferSchemaType<typeof settingsSchema> & {
  _id: mongoose.Types.ObjectId;
};

export type CategoryDocument = InferSchemaType<typeof categorySchema> & {
  _id: mongoose.Types.ObjectId;
};

export type OfferDocument = InferSchemaType<typeof offerSchema> & {
  _id: mongoose.Types.ObjectId;
};

export type PromoCodeDocument = InferSchemaType<typeof promoCodeSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
};

export type OrderDocument = InferSchemaType<typeof orderSchema> & {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
};

export const SettingsModel =
  (mongoose.models.Settings as Model<SettingsDocument>) ||
  mongoose.model<SettingsDocument>("Settings", settingsSchema);

export const CategoryModel =
  (mongoose.models.Category as Model<CategoryDocument>) ||
  mongoose.model<CategoryDocument>("Category", categorySchema);

export const OfferModel =
  (mongoose.models.Offer as Model<OfferDocument>) ||
  mongoose.model<OfferDocument>("Offer", offerSchema);

export const PromoCodeModel =
  (mongoose.models.PromoCode as Model<PromoCodeDocument>) ||
  mongoose.model<PromoCodeDocument>("PromoCode", promoCodeSchema);

export const OrderModel =
  (mongoose.models.Order as Model<OrderDocument>) ||
  mongoose.model<OrderDocument>("Order", orderSchema);
