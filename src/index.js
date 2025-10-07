#!/usr/bin/env node

const { Command } = require('commander');
const authCommand = require('./commands/auth');
const listCommand = require('./commands/list');
const classCommand = require('./commands/class');
const assignmentCommand = require('./commands/assignment');
const submitCommand = require('./commands/submit');
const rawCommand = require('./commands/raw');
const openCommand = require('./commands/open');
const chalk = require('chalk');

const program = new Command();

program
  .name('canvas')
  .description('CLI tool for Clemson Canvas LMS')
  .version('1.0.0');

// Auth command
program
  .command('auth')
  .description('Authenticate with Canvas (stores token and auto-detects URL)')
  .action(authCommand);

// List command - default behavior
program
  .command('list')
  .description('List assignments due in the next 3 days')
  .action(() => listCommand({}));

// List all command
program
  .command('list-all')
  .description('List all assignments')
  .action(() => listCommand({ all: true }));

// List all due command
program
  .command('list-all-due')
  .description('List all due assignments')
  .action(() => listCommand({ all: true, due: true }));

// List all overdue command
program
  .command('list-all-overdue')
  .description('List all overdue assignments')
  .action(() => listCommand({ all: true, overdue: true }));

// Class command
program
  .command('class')
  .description('Select and view class details (assignments due in next 3 days)')
  .action(() => classCommand({}));

// Class all command
program
  .command('class-all')
  .description('Select and view class details (all assignments)')
  .action(() => classCommand({ all: true }));

// Assignment command
program
  .command('assignment')
  .description('Select and view assignment details (assignments due in next 3 days)')
  .action(() => assignmentCommand({}));

// Assignment all command
program
  .command('assignment-all')
  .description('Select and view assignment details (all assignments)')
  .action(() => assignmentCommand({ all: true }));

// Submit command
program
  .command('submit')
  .description('Submit a file for an assignment')
  .action(submitCommand);

// Raw command
program
  .command('raw <endpoint>')
  .description('Make a raw Canvas API request and display the response')
  .action(rawCommand);

// Open command
program
  .command('open')
  .description('Open Canvas in default browser')
  .action(openCommand);

// Check if no command provided before parsing
const args = process.argv.slice(2);
if (args.length === 0) {
  // Default to list command (assignments due in next 3 days)
  listCommand({});
} else {
  program.parse(process.argv);
}
