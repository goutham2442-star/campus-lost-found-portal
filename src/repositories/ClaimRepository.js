const { getMode, fileStores } = require("../config/db");
const MongooseClaim = require("../models/Claim");
const claimStore = fileStores.claims;

class ClaimRepository {
  static async create(data) {
    if (getMode() === "mongo") {
      const claim = new MongooseClaim(data);
      return await claim.save();
    } else {
      const now = new Date();
      const doc = await claimStore.insert({
        ...data,
        status: data.status || "Pending",
        adminRemark: data.adminRemark || "",
        createdAt: now,
        updatedAt: now
      });
      return { ...doc, id: doc._id };
    }
  }

  static async find(filter = {}, { sort = { createdAt: -1 } } = {}) {
    if (getMode() === "mongo") {
      return await MongooseClaim.find(filter)
        .populate("item")
        .populate("claimant", "name email department phone")
        .populate("reviewedBy", "name")
        .sort(sort);
    } else {
      const docs = await claimStore.find(filter).sort(sort);
      return docs.map(d => ({ ...d, id: d._id }));
    }
  }

  static async findOne(filter) {
    if (getMode() === "mongo") {
      return await MongooseClaim.findOne(filter);
    } else {
      const doc = await claimStore.findOne(filter);
      return doc ? { ...doc, id: doc._id } : null;
    }
  }

  static async findById(id) {
    if (getMode() === "mongo") {
      return await MongooseClaim.findById(id).populate("item").populate("claimant");
    } else {
      const doc = await claimStore.findOne({ _id: id });
      return doc ? { ...doc, id: doc._id } : null;
    }
  }

  static async updateById(id, updates) {
    if (getMode() === "mongo") {
      return await MongooseClaim.findByIdAndUpdate(id, updates, { new: true });
    } else {
      await claimStore.update({ _id: id }, { $set: { ...updates, updatedAt: new Date() } });
      return await this.findById(id);
    }
  }

  static async count(filter = {}) {
    if (getMode() === "mongo") {
      return await MongooseClaim.countDocuments(filter);
    } else {
      return await claimStore.count(filter);
    }
  }

  static async clearAll() {
    if (getMode() === "mongo") {
      await MongooseClaim.deleteMany({});
    } else {
      await claimStore.remove({}, { multi: true });
    }
  }
}

module.exports = ClaimRepository;
