const { getMode, fileStores } = require("../config/db");
const MongooseItem = require("../models/Item");
const itemStore = fileStores.items;

class ItemRepository {
  static async create(data) {
    if (getMode() === "mongo") {
      const item = new MongooseItem(data);
      return await item.save();
    } else {
      const now = new Date();
      const doc = await itemStore.insert({
        ...data,
        status: data.status || "Active",
        createdAt: now,
        updatedAt: now
      });
      return { ...doc, id: doc._id };
    }
  }

  static async find(filter = {}, { sort = {}, skip = 0, limit = 50 } = {}) {
    if (getMode() === "mongo") {
      return await MongooseItem.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("owner", "name email department")
        .lean();
    } else {
      let query = itemStore.find(filter);
      if (sort.date) query = query.sort({ date: sort.date });
      else if (sort.name) query = query.sort({ name: sort.name });
      else query = query.sort({ createdAt: -1 });

      const docs = await query.skip(skip).limit(limit);
      return docs.map(d => ({ ...d, id: d._id }));
    }
  }

  static async findById(id) {
    if (getMode() === "mongo") {
      return await MongooseItem.findById(id).populate("owner", "name email department");
    } else {
      const doc = await itemStore.findOne({ _id: id });
      return doc ? { ...doc, id: doc._id } : null;
    }
  }

  static async updateById(id, updates) {
    if (getMode() === "mongo") {
      return await MongooseItem.findByIdAndUpdate(id, updates, { new: true });
    } else {
      await itemStore.update({ _id: id }, { $set: { ...updates, updatedAt: new Date() } });
      return await this.findById(id);
    }
  }

  static async deleteById(id) {
    if (getMode() === "mongo") {
      return await MongooseItem.findByIdAndDelete(id);
    } else {
      return await itemStore.remove({ _id: id });
    }
  }

  static async count(filter = {}) {
    if (getMode() === "mongo") {
      return await MongooseItem.countDocuments(filter);
    } else {
      return await itemStore.count(filter);
    }
  }

  static async clearAll() {
    if (getMode() === "mongo") {
      await MongooseItem.deleteMany({});
    } else {
      await itemStore.remove({}, { multi: true });
    }
  }
}

module.exports = ItemRepository;
