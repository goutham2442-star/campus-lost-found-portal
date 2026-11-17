const express = require("express");
const router = express.Router();
const ItemRepository = require("../repositories/ItemRepository");
const NotificationRepository = require("../repositories/NotificationRepository");
const { authMiddleware, optionalAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");

const emojiByCategory = {
  Electronics: "🎧",
  Accessories: "🎒",
  "ID & Cards": "🪪",
  Keys: "🔑",
  "Books & Notes": "📓",
  Clothing: "🧥",
  Other: "📦"
};

// Check for potential duplicate reports (Duplicate Alert System)
router.post("/check-duplicates", optionalAuth, async (req, res) => {
  try {
    const { name = "", category = "", location = "", type = "Lost" } = req.body;
    const oppositeType = type === "Lost" ? "Found" : "Lost";

    const cleanWords = name
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(" ")
      .filter(w => w.length > 2);

    const candidates = await ItemRepository.find({
      type: oppositeType,
      status: { $in: ["Active", "Available", "Claimed", "Pending"] }
    }, { limit: 50 });

    const matches = candidates.map(item => {
      let score = 0;
      const itemNameLower = (item.name || "").toLowerCase();
      const itemDescLower = (item.description || "").toLowerCase();
      const itemLocLower = (item.location || "").toLowerCase();

      cleanWords.forEach(word => {
        if (itemNameLower.includes(word)) score += 35;
        if (itemDescLower.includes(word)) score += 15;
      });

      if (location && itemLocLower.includes(location.toLowerCase())) {
        score += 25;
      }

      if (category && item.category === category) {
        score += 20;
      }

      return {
        ...item,
        id: item._id || item.id,
        matchScore: Math.min(score, 100)
      };
    })
    .filter(item => item.matchScore >= 35)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 4);

    res.json({
      success: true,
      hasPotentialMatches: matches.length > 0,
      matches
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// List items with searching, filtering, and pagination
router.get("/", async (req, res) => {
  try {
    const {
      q = "",
      category = "All categories",
      type = "All types",
      location = "",
      status = "All statuses",
      sort = "newest",
      page = 1,
      limit = 30
    } = req.query;

    const filter = {};

    if (type && type !== "All types") {
      filter.type = type;
    }

    if (category && category !== "All categories") {
      filter.category = category;
    }

    if (status && status !== "All statuses") {
      filter.status = status;
    }

    let allItems = await ItemRepository.find(filter, { limit: 1000 });

    if (location && location.trim().length > 0) {
      const locTerm = location.trim().toLowerCase();
      allItems = allItems.filter(i => (i.location || "").toLowerCase().includes(locTerm));
    }

    if (q && q.trim().length > 0) {
      const search = q.trim().toLowerCase();
      allItems = allItems.filter(i =>
        [i.name, i.description, i.location, i.category].some(val =>
          (val || "").toLowerCase().includes(search)
        )
      );
    }

    // Sort
    if (sort === "oldest") {
      allItems.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    } else if (sort === "az") {
      allItems.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else {
      allItems.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    }

    const total = allItems.length;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const paginatedItems = allItems.slice(skip, skip + limitNum).map(i => ({
      ...i,
      id: i._id || i.id
    }));

    res.json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
      items: paginatedItems
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get single item detail
router.get("/:id", async (req, res) => {
  try {
    const item = await ItemRepository.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }
    res.json({ success: true, item: { ...item, id: item._id || item.id } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Invalid item ID or server error." });
  }
});

// Create a new lost/found report
router.post("/", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { name, category, type, location, date, description } = req.body;

    if (!name || !category || !type || !location || !date || !description) {
      return res.status(400).json({ success: false, message: "Please fill in all required fields." });
    }

    if (!["Lost", "Found"].includes(type)) {
      return res.status(400).json({ success: false, message: "Listing type must be Lost or Found." });
    }

    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl.trim();
    }

    const emoji = emojiByCategory[category] || "📦";
    const userId = req.user._id || req.user.id;

    const itemData = {
      name: name.trim().slice(0, 80),
      category,
      type,
      location: location.trim().slice(0, 100),
      date,
      description: description.trim().slice(0, 1000),
      status: "Active",
      emoji,
      imageUrl,
      owner: userId
    };

    const item = await ItemRepository.create(itemData);
    const itemId = item._id || item.id;

    // Create a confirmation notification for the reporter
    await NotificationRepository.create({
      user: userId,
      title: `${type} Item Published`,
      message: `Your report for "${item.name}" is now live on the community board.`,
      type: "item_status",
      relatedItem: itemId
    });

    res.status(201).json({
      success: true,
      message: `Your ${type.toLowerCase()} item report has been published successfully!`,
      item: { ...item, id: itemId }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to create report." });
  }
});

// Update user's own item
router.put("/:id", authMiddleware, upload.single("image"), async (req, res) => {
  try {
    const item = await ItemRepository.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }

    const userId = (req.user._id || req.user.id).toString();
    const ownerId = (item.owner && item.owner._id ? item.owner._id : item.owner).toString();

    if (ownerId !== userId && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized. You can only edit your own listings." });
    }

    const { name, category, location, date, description, status } = req.body;
    const updates = {};

    if (name) updates.name = name.trim().slice(0, 80);
    if (category) {
      updates.category = category;
      updates.emoji = emojiByCategory[category] || "📦";
    }
    if (location) updates.location = location.trim().slice(0, 100);
    if (date) updates.date = date;
    if (description) updates.description = description.trim().slice(0, 1000);
    if (status && ["Active", "Pending", "Claimed", "Returned", "Closed"].includes(status)) {
      updates.status = status;
    }

    if (req.file) {
      updates.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await ItemRepository.updateById(req.params.id, updates);

    res.json({
      success: true,
      message: "Report updated successfully.",
      item: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to update item." });
  }
});

// Delete user's own item
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const item = await ItemRepository.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }

    const userId = (req.user._id || req.user.id).toString();
    const ownerId = (item.owner && item.owner._id ? item.owner._id : item.owner).toString();

    if (ownerId !== userId && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized. You can only delete your own listings." });
    }

    await ItemRepository.deleteById(req.params.id);

    res.json({
      success: true,
      message: "Item listing deleted successfully."
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to delete item." });
  }
});

module.exports = router;
