/**
 * CampusFind Frontend Client Architecture
 * Features:
 * - JWT Auth state management (Sign in, Sign up, Session persistence, Sign out)
 * - Dynamic Navigation & Role-based Header badges
 * - Global Search & Multi-criteria Filtering
 * - Duplicate Detection Alert System
 * - Interactive Claim Submissions with Modal Dialogs
 * - In-app Notifications with Unread Badges
 * - File / Image Upload Preview
 */

const categoryColors = {
  Electronics: "#eee9fa",
  Accessories: "#e0f0e4",
  "ID & Cards": "#f8e4d9",
  Keys: "#f8edc9",
  "Books & Notes": "#f1e9f9",
  Clothing: "#e2f0ee",
  Other: "#f1eee9"
};

function esc(value) {
  if (value === null || value === undefined) return "";
  return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

let toastTimer;
function toast(message) {
  let node = document.querySelector("#toast");
  if (!node) {
    node = document.createElement("div");
    node.id = "toast";
    node.className = "toast";
    node.setAttribute("role", "status");
    document.body.appendChild(node);
  }
  node.textContent = message;
  node.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("show"), 3200);
}

// Auth State Helper
const Auth = {
  getToken() {
    return localStorage.getItem("campusfind_token");
  },
  getUser() {
    try {
      const u = localStorage.getItem("campusfind_user");
      return u ? JSON.parse(u) : null;
    } catch (_) {
      return null;
    }
  },
  setSession(token, user) {
    localStorage.setItem("campusfind_token", token);
    localStorage.setItem("campusfind_user", JSON.stringify(user));
  },
  logout() {
    localStorage.removeItem("campusfind_token");
    localStorage.removeItem("campusfind_user");
    window.location.href = "/";
  },
  isLoggedIn() {
    return !!this.getToken();
  },
  isAdmin() {
    const u = this.getUser();
    return u && u.role === "admin";
  }
};

// API Fetch Helper with Bearer Token
async function apiFetch(url, options = {}) {
  const token = Auth.getToken();
  const headers = { ...options.headers };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (!(options.body instanceof FormData) && !headers["Content-Type"] && options.method && options.method !== "GET") {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && Auth.isLoggedIn()) {
      Auth.logout();
    }
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

function niceDate(value) {
  if (!value) return "";
  const d = new Date(value);
  return isNaN(d) ? value : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Global Header Navigation & Auth UI Setup
async function setupHeader() {
  const headerActions = document.querySelector(".header-actions");
  const mainNav = document.querySelector("#main-nav");
  if (!headerActions) return;

  const user = Auth.getUser();

  if (user) {
    // If admin, append Admin Link to navigation
    if (user.role === "admin" && mainNav && !document.querySelector("#nav-admin")) {
      const adminLink = document.createElement("a");
      adminLink.id = "nav-admin";
      adminLink.href = "/pages/admin.html";
      adminLink.textContent = "Admin Portal";
      if (window.location.pathname.includes("admin.html")) adminLink.className = "active";
      mainNav.appendChild(adminLink);
    }

    // Load unread notifications count
    let unreadCount = 0;
    try {
      const notifData = await apiFetch("/api/notifications");
      unreadCount = notifData.unreadCount || 0;
    } catch (_) {}

    headerActions.innerHTML = `
      <button class="notif-bell-btn" id="header-notif-btn" title="View Notifications" aria-label="Notifications">
        🔔 ${unreadCount > 0 ? `<span class="notif-badge">${unreadCount}</span>` : ""}
      </button>
      <div class="header-user">
        <a href="/pages/my-activity.html" class="user-chip">
          <span>👤 ${esc(user.name.split(" ")[0])}</span>
          <span class="role-tag">${esc(user.role)}</span>
        </a>
        <button class="btn-logout" id="header-logout-btn">Log out</button>
      </div>
      <a class="button button-ink button-small" href="/pages/report.html">＋ Report item</a>
    `;

    document.querySelector("#header-logout-btn").addEventListener("click", () => Auth.logout());
    document.querySelector("#header-notif-btn").addEventListener("click", () => openNotificationModal());
  } else {
    headerActions.innerHTML = `
      <a class="sign-in-link" href="/pages/auth.html">Sign in</a>
      <a class="button button-outline button-small" href="/pages/auth.html?mode=register">Register</a>
      <a class="button button-ink button-small" href="/pages/report.html">＋ Report item</a>
    `;
  }
}

// Notification Modal
async function openNotificationModal() {
  let modal = document.querySelector("#notif-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "notif-modal";
    modal.className = "modal-overlay";
    modal.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h3>Your Notifications</h3>
          <button class="modal-close" onclick="closeNotificationModal()">✕</button>
        </div>
        <div class="modal-body" id="notif-list-body">
          <p>Loading notifications…</p>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  modal.classList.add("active");
  const body = document.querySelector("#notif-list-body");

  try {
    const data = await apiFetch("/api/notifications");
    if (!data.notifications || data.notifications.length === 0) {
      body.innerHTML = `<p class="page-empty">You have no notifications right now.</p>`;
      return;
    }

    body.innerHTML = `
      <div style="display:flex;justify-content:flex-end;margin-bottom:12px;">
        <button class="button button-outline button-small" id="mark-all-read-btn">Mark all as read</button>
      </div>
      <div class="activity-list">
        ${data.notifications.map(n => `
          <div class="activity-row" style="${n.isRead ? 'opacity:0.75;' : 'border-left:3px solid var(--plum);'}">
            <div class="activity-emoji">${n.relatedItem?.emoji || "🔔"}</div>
            <div class="activity-main">
              <strong>${esc(n.title)}</strong>
              <small>${esc(n.message)} · ${niceDate(n.createdAt)}</small>
            </div>
            ${!n.isRead ? `<button class="button button-small button-outline" onclick="markOneRead('${n.id}')">Read</button>` : ""}
          </div>
        `).join("")}
      </div>
    `;

    document.querySelector("#mark-all-read-btn")?.addEventListener("click", async () => {
      await apiFetch("/api/notifications/read-all", { method: "PATCH" });
      toast("All notifications marked as read.");
      openNotificationModal();
      setupHeader();
    });
  } catch (err) {
    body.innerHTML = `<p class="form-message error">${esc(err.message)}</p>`;
  }
}

window.closeNotificationModal = function() {
  document.querySelector("#notif-modal")?.classList.remove("active");
};

window.markOneRead = async function(id) {
  try {
    await apiFetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    openNotificationModal();
    setupHeader();
  } catch (_) {}
};

// Item Card Component
function cardMarkup(item, compact = false) {
  const bg = categoryColors[item.category] || "#f4f0fa";
  const itemId = item._id || item.id;
  const isFound = item.type === "Found";

  const imageOrEmoji = item.imageUrl
    ? `<img src="${esc(item.imageUrl)}" alt="${esc(item.name)}" loading="lazy">`
    : `<span>${esc(item.emoji || "📦")}</span>`;

  if (compact) {
    return `
      <article class="mini-item">
        <div class="mini-item-art" style="background:${bg}">
          <span class="mini-item-badge ${isFound ? 'badge-found' : 'badge-lost'}">${esc(item.type.toUpperCase())}</span>
          <span class="badge-status">${esc(item.status || "Active")}</span>
          ${imageOrEmoji}
        </div>
        <div class="mini-item-body">
          <div class="mini-item-category">${esc(item.category)}</div>
          <h3>${esc(item.name)}</h3>
          <p>${esc(item.description)}</p>
          <div class="mini-item-bottom">
            <span>⌖ ${esc(item.location)}</span>
            <a href="/pages/item-details.html?id=${itemId}">View Details ↗</a>
          </div>
        </div>
      </article>
    `;
  }

  return `
    <article class="mini-item">
      <div class="mini-item-art" style="background:${bg}">
        <span class="mini-item-badge ${isFound ? 'badge-found' : 'badge-lost'}">${esc(item.type.toUpperCase())}</span>
        <span class="badge-status">${esc(item.status || "Active")}</span>
        ${imageOrEmoji}
      </div>
      <div class="mini-item-body">
        <div class="mini-item-category">${esc(item.category)} · ${esc(niceDate(item.date))}</div>
        <h3>${esc(item.name)}</h3>
        <p>${esc(item.description)}</p>
        <div class="mini-item-bottom">
          <span>⌖ ${esc(item.location)}</span>
          <div style="display:flex;gap:8px;align-items:center;">
            <a href="/pages/item-details.html?id=${itemId}" class="text-link" style="font-size:11px;">Details ↗</a>
            ${isFound && item.status !== "Returned"
              ? `<button class="button button-plum button-small" onclick="openClaimModal('${itemId}', '${esc(item.name).replace(/'/g, "\\'")}')">Claim</button>`
              : `<span>${esc(item.status || "Searching")}</span>`
            }
          </div>
        </div>
      </div>
    </article>
  `;
}

// Claim Modal System
window.openClaimModal = function(itemId, itemName) {
  if (!Auth.isLoggedIn()) {
    toast("Please sign in or register to submit an ownership claim.");
    setTimeout(() => {
      window.location.href = `/pages/auth.html?redirect=${encodeURIComponent(window.location.href)}`;
    }, 1200);
    return;
  }

  let modal = document.querySelector("#claim-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "claim-modal";
    modal.className = "modal-overlay";
    document.body.appendChild(modal);
  }

  const user = Auth.getUser();
  const defaultContact = user ? `${user.email}${user.phone ? ' | ' + user.phone : ''}` : "";

  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <h3>Claim Item: ${esc(itemName)}</h3>
        <button class="modal-close" onclick="closeClaimModal()">✕</button>
      </div>
      <div class="modal-body">
        <p style="font-size:12px;color:#8f879b;margin:0 0 16px;">
          To prevent fraudulent claims, describe identifying marks, contents, serial numbers, or features known only to the true owner.
        </p>
        <form id="claim-form">
          <input type="hidden" name="itemId" value="${esc(itemId)}">
          <label>
            Your Verified Contact Information *
            <input name="contact" required value="${esc(defaultContact)}" placeholder="Phone number or university email">
          </label>
          <label>
            Proof of Ownership & Specific Details *
            <textarea name="proof" rows="4" required placeholder="e.g. Scratches, brand label, phone lock wallpaper, contents of the notebook/bottle..."></textarea>
          </label>
          <p class="form-message" id="claim-modal-msg"></p>
          <button type="submit" class="button button-plum">Submit Claim for Review ↗</button>
        </form>
      </div>
    </div>
  `;

  modal.classList.add("active");

  const form = document.querySelector("#claim-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.querySelector("#claim-modal-msg");
    msg.textContent = "";
    msg.className = "form-message";

    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const data = await apiFetch("/api/claims", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      toast("Claim submitted! Campus administration will review your details.");
      closeClaimModal();
      setTimeout(() => window.location.href = "/pages/my-activity.html", 1000);
    } catch (err) {
      msg.textContent = err.message;
      msg.classList.add("error");
    }
  });
};

window.closeClaimModal = function() {
  document.querySelector("#claim-modal")?.classList.remove("active");
};

// Home Page Loader
async function loadHome() {
  const grid = document.querySelector("#recent-grid");
  if (!grid) return;

  try {
    const [statsData, itemsData] = await Promise.all([
      apiFetch("/api/stats/summary"),
      apiFetch("/api/items?limit=6")
    ]);

    const stats = statsData.stats || {};
    if (document.querySelector("#total-count")) document.querySelector("#total-count").textContent = stats.totalReports || 0;
    if (document.querySelector("#found-count")) document.querySelector("#found-count").textContent = stats.foundCount || 0;
    if (document.querySelector("#lost-count")) document.querySelector("#lost-count").textContent = stats.lostCount || 0;
    if (document.querySelector("#returned-count")) document.querySelector("#returned-count").textContent = stats.returnedCount || 0;

    grid.innerHTML = (itemsData.items || []).slice(0, 6).map(i => cardMarkup(i, true)).join("");
  } catch (e) {
    grid.innerHTML = "<p>Reports are currently unavailable. Please refresh.</p>";
  }
}

// Listing Page Loader (Lost / Found items)
async function loadListing() {
  const grid = document.querySelector("#listing-grid");
  if (!grid) return;

  const search = document.querySelector("#list-search");
  const cat = document.querySelector("#list-category");
  const sort = document.querySelector("#list-sort");
  const count = document.querySelector("#page-count");
  const empty = document.querySelector("#page-empty");
  const type = document.body.dataset.type || "All types";

  async function render() {
    try {
      const params = new URLSearchParams({
        q: search?.value || "",
        category: cat?.value || "All categories",
        type: type,
        sort: sort?.value || "newest"
      });

      const res = await apiFetch(`/api/items?${params.toString()}`);
      const items = res.items || [];

      if (count) {
        count.textContent = `${items.length} ${items.length === 1 ? "report" : "reports"} on the community board`;
      }

      grid.innerHTML = items.map(i => cardMarkup(i, false)).join("");
      if (empty) empty.hidden = items.length > 0;
      grid.hidden = items.length === 0;
    } catch (e) {
      grid.innerHTML = `<p class="form-message error">Could not load reports (${e.message}).</p>`;
    }
  }

  let timer;
  search?.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(render, 180);
  });
  cat?.addEventListener("change", render);
  sort?.addEventListener("change", render);

  render();
}

// Report Form Handler with Duplicate Item Alert & Image Upload
function setupReport() {
  const form = document.querySelector("#report-page-form");
  if (!form) return;

  const dateInput = form.elements.date;
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().slice(0, 10);
  }

  // Image Preview Logic
  const fileInput = document.querySelector("#item-image-input");
  const imagePreview = document.querySelector("#item-image-preview");
  if (fileInput && imagePreview) {
    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          toast("File too large. Maximum size is 5MB.");
          fileInput.value = "";
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          imagePreview.src = e.target.result;
          imagePreview.style.display = "block";
        };
        reader.readAsDataURL(file);
      } else {
        imagePreview.style.display = "none";
      }
    });
  }

  // Duplicate Check on Item Name / Location blur
  const nameInput = form.elements.name;
  const duplicateAlertContainer = document.querySelector("#duplicate-alert-container");

  let dupTimer;
  async function checkForDuplicates() {
    const name = nameInput.value.trim();
    if (name.length < 3) {
      if (duplicateAlertContainer) duplicateAlertContainer.innerHTML = "";
      return;
    }

    try {
      const dupData = await apiFetch("/api/items/check-duplicates", {
        method: "POST",
        body: JSON.stringify({
          name: name,
          category: form.elements.category.value,
          type: form.elements.type.value,
          location: form.elements.location.value
        })
      });

      if (dupData.hasPotentialMatches && duplicateAlertContainer) {
        duplicateAlertContainer.innerHTML = `
          <div class="duplicate-alert-box">
            <div class="duplicate-alert-header">
              <span>⚠️</span>
              <strong>POSSIBLE EXISTING REPORTS FOUND:</strong>
            </div>
            <p style="font-size:11px;color:#7a6226;margin:0 0 8px;">
              Someone may have already reported a matching item. Check these reports before submitting:
            </p>
            ${dupData.matches.map(m => `
              <div class="duplicate-match-item">
                <div class="duplicate-match-info">
                  <strong>${esc(m.name)} (${esc(m.type)})</strong>
                  <small>Location: ${esc(m.location)} · Date: ${esc(niceDate(m.date))}</small>
                </div>
                <a class="button button-small button-outline" href="/pages/${m.type === 'Found' ? 'found-items' : 'lost-items'}.html" target="_blank">
                  Inspect ↗
                </a>
              </div>
            `).join("")}
          </div>
        `;
      } else if (duplicateAlertContainer) {
        duplicateAlertContainer.innerHTML = "";
      }
    } catch (_) {}
  }

  nameInput?.addEventListener("input", () => {
    clearTimeout(dupTimer);
    dupTimer = setTimeout(checkForDuplicates, 400);
  });

  form.elements.category?.addEventListener("change", checkForDuplicates);
  form.elements.type?.addEventListener("change", checkForDuplicates);

  // Submit Handler
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.querySelector("#report-page-message");
    msg.textContent = "";
    msg.classList.remove("error");

    if (!Auth.isLoggedIn()) {
      toast("Please sign in to publish a report.");
      setTimeout(() => {
        window.location.href = `/pages/auth.html?redirect=${encodeURIComponent(window.location.href)}`;
      }, 1000);
      return;
    }

    const formData = new FormData(form);

    try {
      const data = await apiFetch("/api/items", {
        method: "POST",
        body: formData
      });

      form.reset();
      if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);
      if (imagePreview) imagePreview.style.display = "none";
      if (duplicateAlertContainer) duplicateAlertContainer.innerHTML = "";

      msg.textContent = "Your report has been published to the community board!";
      toast("Report successfully published.");
      setTimeout(() => window.location.href = "/pages/my-activity.html", 1500);
    } catch (err) {
      msg.textContent = err.message;
      msg.classList.add("error");
    }
  });
}

// User Activity & Dashboard Logic
function setupActivity() {
  const list = document.querySelector("#activity-list");
  if (!list) return;

  if (!Auth.isLoggedIn()) {
    list.innerHTML = `
      <div class="page-empty">
        <h3>Sign In Required</h3>
        <p>Please sign in to view and manage your reported items and claims.</p>
        <a class="button button-plum" href="/pages/auth.html">Sign In to Dashboard ↗</a>
      </div>
    `;
    return;
  }

  let mode = "items";
  const buttons = [...document.querySelectorAll("[data-activity]")];

  async function loadDashboardStats() {
    try {
      const data = await apiFetch("/api/stats/user-dashboard");
      const stats = data.stats || {};
      if (document.querySelector("#dash-total-reports")) document.querySelector("#dash-total-reports").textContent = stats.totalMyReports || 0;
      if (document.querySelector("#dash-lost-reports")) document.querySelector("#dash-lost-reports").textContent = stats.lostReports || 0;
      if (document.querySelector("#dash-found-reports")) document.querySelector("#dash-found-reports").textContent = stats.foundReports || 0;
      if (document.querySelector("#dash-active-claims")) document.querySelector("#dash-active-claims").textContent = stats.submittedClaims || 0;
    } catch (_) {}
  }

  async function render() {
    buttons.forEach(b => b.classList.toggle("active", b.dataset.activity === mode));
    list.innerHTML = "<p>Loading your activity…</p>";

    try {
      if (mode === "items") {
        const data = await apiFetch("/api/stats/user-dashboard");
        const items = data.recentItems || [];

        if (items.length === 0) {
          list.innerHTML = `
            <div class="page-empty">
              <h3>No items reported yet</h3>
              <p>You haven't reported any lost or found items on campus.</p>
              <a class="button button-plum" href="/pages/report.html">Report an Item ↗</a>
            </div>
          `;
          return;
        }

        list.innerHTML = items.map(i => `
          <div class="activity-row">
            <div class="activity-emoji">${esc(i.emoji || "📦")}</div>
            <div class="activity-main">
              <strong>${esc(i.name)}</strong>
              <small>${esc(i.type)} report · ${esc(i.location)} · Reported on ${esc(niceDate(i.date))}</small>
            </div>
            <div class="activity-actions">
              <span class="pill ${i.type === 'Lost' ? 'pending' : ''}">${esc(i.status || "Active")}</span>
              <button class="button button-outline button-small" onclick="deleteUserItem('${i.id || i._id}')">Delete</button>
            </div>
          </div>
        `).join("");
      } else {
        const data = await apiFetch("/api/claims/my-claims");
        const claims = data.claims || [];

        if (claims.length === 0) {
          list.innerHTML = `
            <div class="page-empty">
              <h3>No claims submitted</h3>
              <p>You haven't submitted any ownership claims for found items.</p>
              <a class="button button-plum" href="/pages/found-items.html">Browse Found Items ↗</a>
            </div>
          `;
          return;
        }

        list.innerHTML = claims.map(c => `
          <div class="activity-row">
            <div class="activity-emoji">${c.item?.emoji || "♡"}</div>
            <div class="activity-main">
              <strong>Claim for ${esc(c.item?.name || "Found Item")}</strong>
              <small>Submitted on ${esc(niceDate(c.createdAt))} · Status: ${esc(c.status)}</small>
              ${c.adminRemark ? `<small style="color:var(--plum);font-weight:700;">Admin Remark: ${esc(c.adminRemark)}</small>` : ""}
            </div>
            <span class="pill ${c.status === 'Pending' ? 'pending' : c.status === 'Rejected' ? 'rejected' : 'claimed'}">
              ${esc(c.status)}
            </span>
          </div>
        `).join("");
      }
    } catch (e) {
      list.innerHTML = `<p class="form-message error">Unable to load activity (${e.message}).</p>`;
    }
  }

  window.deleteUserItem = async function(id) {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      await apiFetch(`/api/items/${id}`, { method: "DELETE" });
      toast("Listing deleted.");
      render();
      loadDashboardStats();
    } catch (err) {
      toast(err.message);
    }
  };

  buttons.forEach(b => b.addEventListener("click", () => {
    mode = b.dataset.activity;
    render();
  }));

  loadDashboardStats();
  render();
}

// Mobile Menu
function setupMobileMenu() {
  const btn = document.querySelector("#mobile-menu");
  const nav = document.querySelector("#main-nav");
  if (btn && nav) {
    btn.addEventListener("click", () => nav.classList.toggle("open"));
  }
}

// Initializer
document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  setupHeader();
  loadHome();
  loadListing();
  setupReport();
  setupActivity();
});
