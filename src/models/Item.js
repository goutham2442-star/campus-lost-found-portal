const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
      maxlength: [80, "Name cannot exceed 80 characters"]
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Electronics", "Accessories", "ID & Cards", "Keys", "Books & Notes", "Clothing", "Other"],
      default: "Other"
    },
    type: {
      type: String,
      required: [true, "Listing type is required"],
      enum: ["Lost", "Found"]
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"]
    },
    date: {
      type: String,
      required: [true, "Date is required"]
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"]
    },
    status: {
      type: String,
      enum: ["Active", "Pending", "Claimed", "Returned", "Closed"],
      default: "Active"
    },
    imageUrl: {
      type: String,
      default: ""
    },
    emoji: {
      type: String,
      default: "📦"
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner reference is required"]
    }
  },
  {
    timestamps: true
  }
);

itemSchema.index({ name: "text", description: "text", location: "text" });

module.exports = mongoose.model("Item", itemSchema);
