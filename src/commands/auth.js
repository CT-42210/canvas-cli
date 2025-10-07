const inquirer = require('inquirer');
const axios = require('axios');
const chalk = require('chalk');
const config = require('../utils/config');
const { displayError } = require('../utils/errors');

/**
 * Detect Canvas URL from token by trying common Canvas domains
 * and checking /api/v1/users/self endpoint
 */
async function detectCanvasUrl(token) {
  // Common Canvas LMS domains to try
  const commonDomains = [
    'https://clemson.instructure.com',
    'https://canvas.clemson.edu',
    'https://canvas.instructure.com'
  ];

  console.log(chalk.blue('\n[*] Detecting Canvas URL...\n'));

  for (const domain of commonDomains) {
    try {
      console.log(chalk.gray(`  Trying ${domain}...`));
      const response = await axios.get(`${domain}/api/v1/users/self`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 5000
      });

      if (response.status === 200 && response.data.id) {
        console.log(chalk.green(`  [+] Found! Connected as: ${response.data.name}`));
        return domain;
      }
    } catch (error) {
      // Continue trying other domains
      continue;
    }
  }

  return null;
}

/**
 * Auth command - prompts for token and auto-detects Canvas URL
 */
async function authCommand() {
  try {
    console.log(chalk.cyan('\n[AUTH] Canvas CLI Authentication\n'));

    // Prompt for token
    const answers = await inquirer.prompt([
      {
        type: 'password',
        name: 'token',
        message: 'Enter your Canvas access token:',
        mask: '*',
        validate: (input) => {
          if (!input || input.trim().length === 0) {
            return 'Token cannot be empty';
          }
          return true;
        }
      }
    ]);

    const token = answers.token.trim();

    // Try to detect Canvas URL
    const canvasUrl = await detectCanvasUrl(token);

    if (!canvasUrl) {
      // If auto-detection fails, ask user for URL
      console.log(chalk.yellow('\n[!] Could not auto-detect Canvas URL'));
      const urlAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'url',
          message: 'Enter your Canvas URL (e.g., https://clemson.instructure.com):',
          validate: (input) => {
            if (!input || !input.startsWith('http')) {
              return 'Please enter a valid URL starting with http:// or https://';
            }
            return true;
          }
        }
      ]);

      // Verify the manual URL
      try {
        const response = await axios.get(`${urlAnswer.url}/api/v1/users/self`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          config.saveConfig(token, urlAnswer.url.replace(/\/$/, ''));
          console.log(chalk.green('\n[+] Authentication successful!'));
          console.log(chalk.gray(`Logged in as: ${response.data.name}`));
        }
      } catch (error) {
        console.error(chalk.red('\n[X] Failed to authenticate with provided URL'));
        displayError(error);
        process.exit(1);
      }
    } else {
      // Save detected URL
      config.saveConfig(token, canvasUrl);
      console.log(chalk.green('\n[+] Authentication successful!'));
    }

  } catch (error) {
    displayError(error);
    process.exit(1);
  }
}

module.exports = authCommand;
