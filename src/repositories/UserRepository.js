const bcrypt = require("bcryptjs");
const { getMode, fileStores, mongoose } = require("../config/db");
const MongooseUser = require("../models/User");

const userStore = fileStores.users;

class UserRepository {
  static async create({ name, email, password, role = "student", phone = "", department = "General" }) {
    if (getMode() === "mongo") {
      const user = new MongooseUser({ name, email, password, role, phone, department });
      await user.save();
      return user.toJSON();
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const now = new Date();
      const doc = await userStore.insert({
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role,
        phone,
        department,
        createdAt: now,
        updatedAt: now
      });
      const res = { ...doc, id: doc._id };
      delete res.password;
      return res;
    }
  }

  static async findByEmail(email) {
    const cleanEmail = email.toLowerCase().trim();
    if (getMode() === "mongo") {
      return await MongooseUser.findOne({ email: cleanEmail });
    } else {
      const doc = await userStore.findOne({ email: cleanEmail });
      if (!doc) return null;
      return {
        ...doc,
        id: doc._id,
        comparePassword: async function (candidatePassword) {
          return await bcrypt.compare(candidatePassword, this.password);
        }
      };
    }
  }

  static async findById(id) {
    if (getMode() === "mongo") {
      return await MongooseUser.findById(id).select("-password");
    } else {
      const doc = await userStore.findOne({ _id: id });
      if (!doc) return null;
      const res = { ...doc, id: doc._id };
      delete res.password;
      return res;
    }
  }

  static async updateProfile(id, updates) {
    if (getMode() === "mongo") {
      return await MongooseUser.findByIdAndUpdate(id, updates, { new: true }).select("-password");
    } else {
      await userStore.update({ _id: id }, { $set: { ...updates, updatedAt: new Date() } });
      return await this.findById(id);
    }
  }

  static async count(query = {}) {
    if (getMode() === "mongo") {
      return await MongooseUser.countDocuments(query);
    } else {
      return await userStore.count(query);
    }
  }

  static async findAll() {
    if (getMode() === "mongo") {
      return await MongooseUser.find().select("-password").sort({ createdAt: -1 });
    } else {
      const list = await userStore.find({}).sort({ createdAt: -1 });
      return list.map(u => {
        const item = { ...u, id: u._id };
        delete item.password;
        return item;
      });
    }
  }

  static async clearAll() {
    if (getMode() === "mongo") {
      await MongooseUser.deleteMany({});
    } else {
      await userStore.remove({}, { multi: true });
    }
  }
}

module.exports = UserRepository;
