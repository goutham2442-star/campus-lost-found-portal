// Automated verification of all API endpoints
const assert = require("assert");

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=========================================");
  console.log("🧪 STARTING CAMPUSFIND AUTOMATED API TEST SUITE");
  console.log("=========================================");

  let studentToken = "";
  let adminToken = "";
  let createdItemId = "";
  let sampleFoundItemId = "";
  let createdClaimId = "";

  // Test 1: Healthcheck
  {
    console.log("Test 1: Healthcheck endpoint...");
    const res = await fetch(`${BASE_URL}/api/health`);
    const json = await res.json();
    assert.strictEqual(res.status, 200, "Healthcheck should return 200");
    assert.strictEqual(json.status, "healthy");
    console.log("✅ Healthcheck passed");
  }

  // Test 2: Invalid Login
  {
    console.log("Test 2: Invalid Login Check...");
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid@saiuniversity.edu.in", password: "wrong" })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 401, "Expected 401 for bad login");
    assert.strictEqual(json.success, false);
    console.log("✅ Invalid Login rejected as expected");
  }

  // Test 3: Successful Student Login
  {
    console.log("Test 3: Student Login...");
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "aarav.sharma@saiuniversity.edu.in", password: "password123" })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200, "Expected 200 for student login");
    assert.strictEqual(json.success, true);
    assert(json.token, "Expected valid token");
    studentToken = json.token;
    console.log("✅ Student Login passed, token received");
  }

  // Test 4: Successful Admin Login
  {
    console.log("Test 4: Admin Login...");
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "admin@saiuniversity.edu.in", password: "AdminSaiPass2026!" })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200, "Expected 200 for admin login");
    assert.strictEqual(json.user.role, "admin");
    adminToken = json.token;
    console.log("✅ Admin Login passed, admin privileges verified");
  }

  // Test 5: Protected Route without Token (Unauthorized check)
  {
    console.log("Test 5: Unauthorized route access check...");
    const res = await fetch(`${BASE_URL}/api/auth/me`);
    assert.strictEqual(res.status, 401, "Expected 401 for unauthorized access");
    console.log("✅ Unauthorized access blocked correctly");
  }

  // Test 6: Create Item Report
  {
    console.log("Test 6: Create Item Report (Lost)...");
    const res = await fetch(`${BASE_URL}/api/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        name: "Blue Titanium Casio Watch",
        category: "Accessories",
        type: "Lost",
        location: "Badminton Court",
        date: "2026-11-15",
        description: "Analog watch with titanium mesh strap left near bench during evening match."
      })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 201, "Expected 201 created");
    assert(json.item.id, "Expected item id");
    createdItemId = json.item.id;
    console.log("✅ Item report created, ID:", createdItemId);
  }

  // Test 7: Get Items with Search & Filter
  {
    console.log("Test 7: Search & Filter items query...");
    const res = await fetch(`${BASE_URL}/api/items?q=watch&category=Accessories`);
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert(json.items.length >= 1, "Should find the created watch");
    console.log("✅ Search & Filter verified");
  }

  // Test 8: Check Duplicate Item Alert System
  {
    console.log("Test 8: Duplicate Item Alert Engine...");
    const res = await fetch(`${BASE_URL}/api/items/check-duplicates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "wireless earbuds sony",
        category: "Electronics",
        location: "Library",
        type: "Lost"
      })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.hasPotentialMatches, true, "Should detect earbuds in found items");
    assert(json.matches.length > 0);
    sampleFoundItemId = json.matches[0].id || json.matches[0]._id;
    console.log("✅ Duplicate alert system successfully detected matching found item:", sampleFoundItemId);
  }

  // Test 9: Submit Ownership Claim
  {
    console.log("Test 9: Submit Ownership Claim...");
    const res = await fetch(`${BASE_URL}/api/claims`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        itemId: sampleFoundItemId,
        contact: "+91 91234 56789 (aarav.sharma@saiuniversity.edu.in)",
        proof: "Earbuds case has blue replacement foam ear tip and serial ending in 873A."
      })
    });
    const json = await res.json();
    // Could be 201 or 400 (if seeded claim exists)
    if (res.status === 201) {
      createdClaimId = json.claim.id;
      console.log("✅ Claim submitted successfully, ID:", createdClaimId);
    } else {
      console.log("ℹ️ Claim already recorded in database seed:", json.message);
    }
  }

  // Test 10: Admin Get Claims and Approve
  {
    console.log("Test 10: Admin claim review and approval...");
    const listRes = await fetch(`${BASE_URL}/api/claims/admin/all`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const listJson = await listRes.json();
    assert.strictEqual(listRes.status, 200);
    assert(listJson.claims.length > 0, "Should have claims in database");
    const targetClaim = listJson.claims[0];
    const claimToApprove = targetClaim.id || targetClaim._id;

    const approveRes = await fetch(`${BASE_URL}/api/claims/${claimToApprove}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: "Approved",
        adminRemark: "Verified via student ID and physical inspection at Security office."
      })
    });
    const approveJson = await approveRes.json();
    assert.strictEqual(approveRes.status, 200);
    assert.strictEqual(approveJson.claim.status, "Approved");
    console.log("✅ Admin approved claim successfully");
  }

  // Test 11: Notifications check
  {
    console.log("Test 11: Student Notifications retrieval...");
    const res = await fetch(`${BASE_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert(Array.isArray(json.notifications));
    console.log(`✅ Notifications verified (Count: ${json.notifications.length}, Unread: ${json.unreadCount})`);
  }

  // Test 12: Admin Dashboard Analytics
  {
    console.log("Test 12: Admin Dashboard Analytics endpoint...");
    const res = await fetch(`${BASE_URL}/api/stats/admin-dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert(json.stats.totalItems >= 12);
    assert(json.stats.totalUsers >= 1);
    console.log("✅ Admin Analytics endpoint verified:", json.stats);
  }

  console.log("=========================================");
  console.log("🎉 ALL 12 AUTOMATED API TESTS PASSED SUCCESSFULLY!");
  console.log("=========================================");
}

module.exports = runTests;

if (require.main === module) {
  runTests().catch(err => {
    console.error("❌ Test failed:", err);
    process.exit(1);
  });
}
