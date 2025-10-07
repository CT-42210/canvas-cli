const fs = require('fs');
const path = require('path');
require('dotenv').config({ quiet: true });

const ENV_PATH = path.join(__dirname, '../../.env');

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
