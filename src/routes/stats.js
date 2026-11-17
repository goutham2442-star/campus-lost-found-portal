const express = require("express");
const router = express.Router();
const UserRepository = require("../repositories/UserRepository");
const ItemRepository = require("../repositories/ItemRepository");
const ClaimRepository = require("../repositories/ClaimRepository");
const { authMiddleware, adminOnly } = require("../middleware/auth");

// Public overview statistics (for homepage counters)
router.get("/summary", async (req, res) => {
  try {
    const [totalReports, foundCount, lostCount, returnedCount, pendingClaims] = await Promise.all([
      ItemRepository.count({}),
      ItemRepository.count({ type: "Found" }),
      ItemRepository.count({ type: "Lost" }),
      ItemRepository.count({ status: "Returned" }),
      ClaimRepository.count({ status: "Pending" })
    ]);

    res.json({
      success: true,
      stats: {
        totalReports,
        foundCount,
        lostCount,
        returnedCount,
        pendingClaims
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Authenticated Student Dashboard Statistics
router.get("/user-dashboard", authMiddleware, async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();

    const [
      myLostReports,
      myFoundReports,
      myActiveReports,
      myTotalClaims,
      myApprovedClaims,
      userItems,
      userClaims
    ] = await Promise.all([
      ItemRepository.count({ owner: userId, type: "Lost" }),
      ItemRepository.count({ owner: userId, type: "Found" }),
      ItemRepository.count({ owner: userId, status: "Active" }),
      ClaimRepository.count({ claimant: userId }),
      ClaimRepository.count({ claimant: userId, status: "Approved" }),
      ItemRepository.find({ owner: userId }, { limit: 10 }),
      ClaimRepository.find({ claimant: userId }, { limit: 10 })
    ]);

    const populatedClaims = await Promise.all(
      userClaims.map(async c => {
        const it = await ItemRepository.findById(c.item);
        return {
          ...c,
          id: c._id || c.id,
          item: it ? { id: it._id || it.id, name: it.name, type: it.type, emoji: it.emoji, category: it.category } : null
        };
      })
    );

    res.json({
      success: true,
      stats: {
        totalMyReports: myLostReports + myFoundReports,
        lostReports: myLostReports,
        foundReports: myFoundReports,
        activeReports: myActiveReports,
        submittedClaims: myTotalClaims,
        approvedClaims: myApprovedClaims
      },
      recentItems: userItems.map(i => ({ ...i, id: i._id || i.id })),
      recentClaims: populatedClaims
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Analytics and Management Dashboard
router.get("/admin-dashboard", authMiddleware, adminOnly, async (req, res) => {
  try {
    const [
      totalUsers,
      totalItems,
      lostItems,
      foundItems,
      activeItems,
      claimedItems,
      returnedItems,
      totalClaims,
      pendingClaims,
      approvedClaims,
      rejectedClaims,
      allItems
    ] = await Promise.all([
      UserRepository.count({ role: "student" }),
      ItemRepository.count({}),
      ItemRepository.count({ type: "Lost" }),
      ItemRepository.count({ type: "Found" }),
      ItemRepository.count({ status: "Active" }),
      ItemRepository.count({ status: "Claimed" }),
      ItemRepository.count({ status: "Returned" }),
      ClaimRepository.count({}),
      ClaimRepository.count({ status: "Pending" }),
      ClaimRepository.count({ status: "Approved" }),
      ClaimRepository.count({ status: "Rejected" }),
      ItemRepository.find({}, { limit: 1000 })
    ]);

    // Calculate category breakdown
    const categoryMap = {};
    allItems.forEach(it => {
      const cat = it.category || "Other";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    const categoryBreakdown = Object.keys(categoryMap).map(k => ({
      category: k,
      count: categoryMap[k]
    })).sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalItems,
        lostItems,
        foundItems,
        activeItems,
        claimedItems,
        returnedItems,
        totalClaims,
        pendingClaims,
        approvedClaims,
        rejectedClaims
      },
      categoryBreakdown
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Manage users list
router.get("/admin/users", authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await UserRepository.findAll();
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
