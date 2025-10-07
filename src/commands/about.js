const chalk = require('chalk');
const axios = require('axios');
const config = require('../utils/config');
const { version } = require('../../package.json');
const asciify = require('asciify-image');
const path = require('path');

/**
 * Convert image to ASCII art
 */
async function imageToAscii(imagePath, options = {}) {
  try {
    const ascii = await asciify(imagePath, {
      fit: 'box',
      width: options.width || 30,
      height: options.height || 20,
      color: options.color !== false,
      format: 'string',
      c_ratio: 2,
      ...options
    });
    // Remove trailing whitespace from each line to clean up transparent areas
    return ascii.split('\n').map(line => line.trimEnd()).join('\n');
  } catch (error) {
    return null;
  }
}

/**
 * Combine two ASCII art strings side by side
 */
function combineAsciiSideBySide(left, right, spacing = 4) {
  if (!left && !right) return '';
  if (!left) return right;
  if (!right) return left;

  const leftLines = left.split('\n');
  const rightLines = right.split('\n');
  const maxLines = Math.max(leftLines.length, rightLines.length);
  const leftWidth = Math.max(...leftLines.map(l => l.replace(/\u001b\[[0-9;]*m/g, '').length));
  const spacer = ' '.repeat(spacing);

  const combined = [];
  for (let i = 0; i < maxLines; i++) {
    const leftLine = leftLines[i] || '';
    const rightLine = rightLines[i] || '';
    const leftPadding = leftWidth - leftLine.replace(/\u001b\[[0-9;]*m/g, '').length;
    combined.push(leftLine + ' '.repeat(leftPadding) + spacer + rightLine);
  }
  return combined.join('\n');
}

/**
 * About command - display project info and ASCII art
 */
async function aboutCommand() {
  console.log('\n');

  // Generate ASCII art for Canvas logo from local file
  const logoPath = path.join(__dirname, '../../canvas.png');
  const canvasAscii = await imageToAscii(logoPath, { width: 30, height: 18, color: false });

  if (canvasAscii) {
    // Color the logo red
    const redLogo = canvasAscii.split('\n').map(line => chalk.red(line)).join('\n');

    // Create info text
    const info = [
      chalk.cyan.bold('CANVAS CLI'),
      '',
      chalk.bold('Version: ') + chalk.green(`v${version}`),
      chalk.bold('Author:  ') + chalk.yellow('Nick Troiano'),
      chalk.bold('School:  ') + chalk.white('Clemson University'),
      chalk.bold('GitHub:  ') + chalk.blue('https://github.com/CT-42210/canvas-cli'),
      '',
      chalk.gray('A modern CLI for Canvas LMS'),
      chalk.gray('Built with Node.js, Inquirer, and Chalk')
    ];

    // Combine logo and info side by side
    const combined = combineAsciiSideBySide(redLogo, info.join('\n'), 8);
    console.log(combined.split('\n').map(line => '  ' + line).join('\n'));
  } else {
    // Fallback if logo fails to load
    console.log(chalk.bold('  Version: ') + chalk.green(`v${version}`));
    console.log(chalk.bold('  Author:  ') + chalk.yellow('Nick Troiano'));
    console.log(chalk.bold('  School:  ') + chalk.hex('#F66733')('Clemson University'));
    console.log(chalk.bold('  GitHub:  ') + chalk.blue('https://github.com/CT-42210/canvas-cli'));
    console.log(chalk.gray('\n  A modern CLI for Canvas LMS'));
    console.log(chalk.gray('  Built with Node.js, Inquirer, and Chalk'));
  }

  console.log('\n');
}

module.exports = aboutCommand;
