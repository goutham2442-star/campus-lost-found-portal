const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: [true, "Item reference is required"]
    },
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Claimant reference is required"]
    },
    contact: {
      type: String,
      required: [true, "Contact information is required"],
      trim: true,
      maxlength: 120
    },
    proof: {
      type: String,
      required: [true, "Proof / identifying description is required"],
      trim: true,
      maxlength: 1000
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Completed"],
      default: "Pending"
    },
    adminRemark: {
      type: String,
      trim: true,
      default: ""
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    reviewedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

claimSchema.index({ item: 1, claimant: 1 });

module.exports = mongoose.model("Claim", claimSchema);
