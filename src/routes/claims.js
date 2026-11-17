const express = require("express");
const router = express.Router();
const ClaimRepository = require("../repositories/ClaimRepository");
const ItemRepository = require("../repositories/ItemRepository");
const NotificationRepository = require("../repositories/NotificationRepository");
const UserRepository = require("../repositories/UserRepository");
const { authMiddleware, adminOnly } = require("../middleware/auth");

// Submit a claim for a found item
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { itemId, contact, proof } = req.body;

    if (!itemId || !contact || !proof) {
      return res.status(400).json({ success: false, message: "Item ID, contact details, and proof/identifying info are required." });
    }

    const item = await ItemRepository.findById(itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found." });
    }

    if (item.type !== "Found") {
      return res.status(400).json({ success: false, message: "Claims can only be filed against Found items." });
    }

    const userId = (req.user._id || req.user.id).toString();
    const ownerId = (item.owner && item.owner._id ? item.owner._id : item.owner).toString();

    if (ownerId === userId) {
      return res.status(400).json({ success: false, message: "You cannot claim an item that you reported found yourself." });
    }

    // Check for duplicate pending claim by same user
    const existingClaims = await ClaimRepository.find({
      item: itemId,
      claimant: userId
    });

    const hasActive = existingClaims.some(c => ["Pending", "Approved"].includes(c.status));
    if (hasActive) {
      return res.status(400).json({
        success: false,
        message: "You already have an active claim submitted for this item."
      });
    }

    const claimData = {
      item: itemId,
      claimant: userId,
      contact: contact.trim().slice(0, 120),
      proof: proof.trim().slice(0, 1000),
      status: "Pending"
    };

    const claim = await ClaimRepository.create(claimData);
    const claimId = claim._id || claim.id;

    // Notify claimant
    await NotificationRepository.create({
      user: userId,
      title: "Claim Submitted Successfully",
      message: `Your recovery claim for "${item.name}" has been recorded and is pending administrative verification.`,
      type: "claim_submitted",
      relatedItem: itemId
    });

    // Notify finder
    await NotificationRepository.create({
      user: ownerId,
      title: "New Claim Received",
      message: `Someone submitted an ownership claim for the "${item.name}" you reported. The administration team will verify details.`,
      type: "claim_submitted",
      relatedItem: itemId
    });

    res.status(201).json({
      success: true,
      message: "Your ownership claim has been submitted to campus administrators for review.",
      claim: { ...claim, id: claimId }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to submit claim." });
  }
});

// Get current user's submitted claims
router.get("/my-claims", authMiddleware, async (req, res) => {
  try {
    const userId = (req.user._id || req.user.id).toString();
    const claims = await ClaimRepository.find({ claimant: userId });

    // Populate item details
    const populated = await Promise.all(
      claims.map(async c => {
        const item = await ItemRepository.findById(c.item);
        return {
          ...c,
          id: c._id || c.id,
          item: item ? { ...item, id: item._id || item.id } : null
        };
      })
    );

    res.json({
      success: true,
      claims: populated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Get all claims
router.get("/admin/all", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { status = "All" } = req.query;
    const filter = {};
    if (status && status !== "All") {
      filter.status = status;
    }

    const claims = await ClaimRepository.find(filter);
    const populated = await Promise.all(
      claims.map(async c => {
        const [item, claimant] = await Promise.all([
          ItemRepository.findById(c.item),
          UserRepository.findById(c.claimant)
        ]);
        return {
          ...c,
          id: c._id || c.id,
          item: item ? { ...item, id: item._id || item.id } : null,
          claimant: claimant ? { ...claimant, id: claimant._id || claimant.id } : null
        };
      })
    );

    res.json({
      success: true,
      claims: populated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: Update claim status (Approve / Reject / Complete)
router.patch("/:id/status", authMiddleware, adminOnly, async (req, res) => {
  try {
    const { status, adminRemark = "" } = req.body;
    if (!["Pending", "Approved", "Rejected", "Completed"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid claim status. Must be Pending, Approved, Rejected, or Completed." });
    }

    const claim = await ClaimRepository.findById(req.params.id);
    if (!claim) {
      return res.status(404).json({ success: false, message: "Claim not found." });
    }

    const updates = {
      status,
      adminRemark: adminRemark.trim(),
      reviewedBy: req.user._id || req.user.id,
      reviewedAt: new Date()
    };

    const updatedClaim = await ClaimRepository.updateById(req.params.id, updates);

    // Update item status if approved or completed
    const item = await ItemRepository.findById(claim.item);
    if (item) {
      const itemId = item._id || item.id;
      if (status === "Approved") {
        await ItemRepository.updateById(itemId, { status: "Claimed" });
      } else if (status === "Completed") {
        await ItemRepository.updateById(itemId, { status: "Returned" });
      }
    }

    // Send notification to the student claimant
    const claimantId = claim.claimant && claim.claimant._id ? claim.claimant._id : claim.claimant;
    let notificationTitle = `Claim Update: ${status}`;
    let notificationMessage = `Your claim for "${item ? item.name : "Item"}" has been ${status.toLowerCase()}.`;
    if (adminRemark) {
      notificationMessage += ` Admin remark: ${adminRemark}`;
    }

    await NotificationRepository.create({
      user: claimantId.toString(),
      title: notificationTitle,
      message: notificationMessage,
      type: status === "Approved" ? "claim_approved" : status === "Rejected" ? "claim_rejected" : "item_status",
      relatedItem: item ? (item._id || item.id) : null
    });

    res.json({
      success: true,
      message: `Claim has been ${status.toLowerCase()} successfully.`,
      claim: updatedClaim
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || "Failed to update claim." });
  }
});

module.exports = router;
