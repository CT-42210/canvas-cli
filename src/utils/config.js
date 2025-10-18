const fs = require('fs');
const path = require('path');
const os = require('os');

// Store config in user's home directory for consistent access
const CONFIG_DIR = path.join(os.homedir(), '.canvas-cli');
const ENV_PATH = path.join(CONFIG_DIR, '.env');

// Ensure config directory exists
if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

// Load environment variables from the consistent location
// quiet: true suppresses dotenv promotional/runtime messages
require('dotenv').config({ path: ENV_PATH, quiet: true });

/**
 * Get Canvas authentication token from .env file
 */
function getToken() {
  return process.env.CANVAS_TOKEN;
}

/**
 * Get Canvas URL from .env file
 */
function getCanvasUrl() {
  return process.env.CANVAS_URL;
}

/**
 * Save Canvas token and URL to .env file
 */
function saveConfig(token, url) {
  const envContent = `CANVAS_TOKEN=${token}\nCANVAS_URL=${url}\n`;
  fs.writeFileSync(ENV_PATH, envContent);

  // Reload the env variables
  process.env.CANVAS_TOKEN = token;
  process.env.CANVAS_URL = url;
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  return !!getToken() && !!getCanvasUrl();
}

module.exports = {
  getToken,
  getCanvasUrl,
  saveConfig,
  isAuthenticated
};
