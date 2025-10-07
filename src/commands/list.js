const chalk = require('chalk');
const { getAllAssignments } = require('../api/client');
const { isDueWithinDays, isOverdue, isDue, sortByDueDate } = require('../utils/dates');
const { displayAssignmentsList } = require('../ui/display');
const { displayError, requireAuth } = require('../utils/errors');
const config = require('../utils/config');

/**
 * List assignments with various filters
 */
async function listCommand(options) {
  try {
    requireAuth(config);

    console.log(chalk.cyan('\n[*] Loading assignments...\n'));

    const allAssignments = await getAllAssignments();

    let filteredAssignments = [];

    if (options.all && options.overdue) {
      // canvas list all overdue
      filteredAssignments = allAssignments.filter(isOverdue);
    } else if (options.all && options.due) {
      // canvas list all due
      filteredAssignments = allAssignments.filter(isDue);
    } else if (options.all) {
      // canvas list all
      filteredAssignments = allAssignments;
    } else {
      // canvas list (default: next 3 days)
      filteredAssignments = allAssignments.filter(a => isDueWithinDays(a, 3));
    }

    // Sort by due date
    const sortedAssignments = sortByDueDate(filteredAssignments);

    displayAssignmentsList(sortedAssignments);

  } catch (error) {
    displayError(error);
    process.exit(1);
  }
}

module.exports = listCommand;
