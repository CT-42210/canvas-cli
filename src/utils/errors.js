const chalk = require('chalk');

/**
 * Display complete error message - NEVER truncate
 * This follows the critical requirement in outline.txt
 */
function displayError(error) {
  console.error(chalk.red('\n[ERROR]\n'));

  if (error.response) {
    // HTTP error response
    console.error(chalk.red('Status:'), error.response.status);
    console.error(chalk.red('Status Text:'), error.response.statusText);
    console.error(chalk.red('URL:'), error.config?.url || 'N/A');
    console.error(chalk.red('\nResponse Data:'));
    console.error(JSON.stringify(error.response.data, null, 2));
  } else if (error.request) {
    // Request made but no response
    console.error(chalk.red('No response received from server'));
    console.error(chalk.red('Request:'), error.request);
  } else {
    // Something else happened
    console.error(chalk.red('Message:'), error.message);
  }

  // Always show stack trace
  console.error(chalk.red('\nStack Trace:'));
  console.error(error.stack);
}

/**
 * Require authentication - exit if not authenticated
 */
function requireAuth(config) {
  if (!config.isAuthenticated()) {
    console.error(chalk.red('\n[!] Not authenticated. Please run:'));
    console.error(chalk.yellow('  canvas auth\n'));
    process.exit(1);
  }
}

module.exports = {
  displayError,
  requireAuth
};
