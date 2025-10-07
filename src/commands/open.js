const chalk = require('chalk');
const open = require('open');
const config = require('../utils/config');
const { requireAuth } = require('../utils/errors');

/**
 * Open Canvas in default browser
 */
async function openCommand() {
  try {
    requireAuth(config);

    const canvasUrl = config.getCanvasUrl();

    console.log(chalk.cyan('\n[*] Opening Canvas in browser...\n'));

    await open(canvasUrl);

    console.log(chalk.green('[+] Opened Canvas in browser\n'));

  } catch (error) {
    console.error(chalk.red('Error opening browser:'), error.message);
    process.exit(1);
  }
}

module.exports = openCommand;
