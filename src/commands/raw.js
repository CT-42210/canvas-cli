const chalk = require('chalk');
const { makeRawRequest } = require('../api/client');
const { displayError, requireAuth } = require('../utils/errors');
const config = require('../utils/config');

/**
 * Raw command - make a raw API request and display the response
 */
async function rawCommand(endpoint) {
  try {
    requireAuth(config);

    if (!endpoint) {
      console.error(chalk.red('\nError: Please provide an API endpoint'));
      console.log(chalk.yellow('Usage: canvas raw <endpoint>'));
      console.log(chalk.yellow('Example: canvas raw /api/v1/users/self\n'));
      process.exit(1);
    }

    // Ensure endpoint starts with /
    if (!endpoint.startsWith('/')) {
      endpoint = '/' + endpoint;
    }

    console.log(chalk.cyan(`\n[*] Fetching: ${endpoint}\n`));

    const data = await makeRawRequest(endpoint);

    // Pretty print the JSON response
    console.log(JSON.stringify(data, null, 2));
    console.log();

  } catch (error) {
    displayError(error);
    process.exit(1);
  }
}

module.exports = rawCommand;
