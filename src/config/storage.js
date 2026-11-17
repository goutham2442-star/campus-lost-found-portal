const path = require("path");
const fs = require("fs");

// On Vercel serverless, /var/task is read-only, but /tmp is writable
function getStorageDir(folderName) {
  if (process.env.VERCEL) {
    const tmpDir = path.join("/tmp", folderName);
    if (!fs.existsSync(tmpDir)) {
      try { fs.mkdirSync(tmpDir, { recursive: true }); } catch (_) {}
    }
    return tmpDir;
  }

  // Local environment
  const localDir = path.join(__dirname, "../../", folderName);
  if (!fs.existsSync(localDir)) {
    try { fs.mkdirSync(localDir, { recursive: true }); } catch (_) {}
  }
  return localDir;
}

module.exports = { getStorageDir };
