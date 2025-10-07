const chalk = require('chalk');
const inquirer = require('inquirer');
const open = require('open');
const { formatDate, getDueDateColor } = require('../utils/dates');

// Cache for course colors to ensure consistency
const courseColorCache = new Map();

/**
 * Get consistent color for course based on Canvas custom color or fallback
 */
function getCourseColor(courseName, courseId, customColor) {
  // Use course ID as key for consistency
  const key = courseId || courseName;

  if (courseColorCache.has(key)) {
    return courseColorCache.get(key);
  }

  let colorFunc;

  // Use custom Canvas color if available
  if (customColor) {
    colorFunc = (text) => chalk.hex(customColor)(text);
  } else {
    // Fallback: assign color based on hash of course identifier
    const colors = [chalk.cyan, chalk.green, chalk.yellow, chalk.magenta, chalk.blue, chalk.red];
    const hash = key ? String(key).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;
    colorFunc = colors[hash % colors.length];
  }

  courseColorCache.set(key, colorFunc);
  return colorFunc;
}

/**
 * Display a list of assignments in a table format
 */
function displayAssignmentsList(assignments) {
  if (assignments.length === 0) {
    console.log(chalk.yellow('\nNo assignments found\n'));
    return;
  }

  console.log(chalk.bold('\nAssignments\n'));

  assignments.forEach((assignment, index) => {
    const courseColor = getCourseColor(assignment.course_name, assignment.course_id, assignment.course_color);
    const dueDate = formatDate(assignment.due_at);
    const dueDateColor = getDueDateColor(assignment.due_at);

    console.log(`${chalk.gray(`${index + 1}.`)} ${courseColor(`[${assignment.course_name}]`)} ${chalk.bold(assignment.name)}`);
    console.log(`   Due: ${chalk[dueDateColor](dueDate)}`);

    if (assignment.points_possible) {
      console.log(`   Points: ${assignment.points_possible}`);
    }

    console.log(); // Empty line between assignments
  });
}

/**
 * Display detailed assignment information with action menu
 */
async function displayAssignmentDetails(assignment) {
  const courseColor = getCourseColor(assignment.course_name, assignment.course_id, assignment.course_color);
  const dueDateColor = getDueDateColor(assignment.due_at);

  console.log(chalk.bold('\n' + '='.repeat(80)));
  console.log(courseColor(chalk.bold(`  ${assignment.course_name}`)));
  console.log(chalk.bold('='.repeat(80)));
  console.log(chalk.bold(`\n${assignment.name}\n`));

  console.log(chalk.gray('Due Date:'), chalk[dueDateColor](formatDate(assignment.due_at)));

  if (assignment.points_possible) {
    console.log(chalk.gray('Points:'), assignment.points_possible);
  }

  console.log(chalk.gray('Submission Types:'), assignment.submission_types.join(', '));

  if (assignment.description) {
    // Strip HTML tags for CLI display
    const cleanDescription = assignment.description.replace(/<[^>]*>/g, '').trim();
    if (cleanDescription) {
      console.log(chalk.gray('\nDescription:'));
      console.log(cleanDescription.substring(0, 500) + (cleanDescription.length > 500 ? '...' : ''));
    }
  }

  console.log(chalk.bold('\n' + '='.repeat(80) + '\n'));

  // Action menu
  const actions = [
    { name: '1. Open in browser', value: 'open' },
    { name: '2. Return to terminal', value: 'exit' }
  ];

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Choose an action:',
      choices: actions
    }
  ]);

  if (answer.action === 'open') {
    await open(assignment.html_url);
    console.log(chalk.green('\n[+] Opened in browser\n'));
  }
}

/**
 * Display detailed course information with action menu
 * @param {Object} course - The course object
 * @param {Array} filteredAssignments - Assignments to show in summary (e.g., due within 3 days)
 * @param {Array} allAssignments - All assignments to show when "View all" is selected
 */
async function displayCourseDetails(course, filteredAssignments, allAssignments = null) {
  // If allAssignments not provided, use filtered assignments for both
  if (!allAssignments) {
    allAssignments = filteredAssignments;
  }

  const courseColor = getCourseColor(course.name, course.id, course.custom_color);

  console.log(chalk.bold('\n' + '='.repeat(80)));
  console.log(courseColor(chalk.bold(`  ${course.name}`)));
  console.log(chalk.bold('='.repeat(80)));
  console.log(chalk.gray('\nCourse Code:'), course.course_code);

  if (course.term) {
    console.log(chalk.gray('Term:'), course.term.name);
  }

  console.log(chalk.gray('\nTotal Assignments:'), allAssignments.length);

  // Show upcoming assignments from filtered list (exclude past assignments)
  const now = new Date();
  const upcoming = filteredAssignments.filter(a => {
    if (!a.due_at) return false;
    const dueDate = new Date(a.due_at);
    // Only show if due in future
    return dueDate > now;
  });

  console.log(chalk.gray('Upcoming Assignments (next 3 days):'), upcoming.length);

  if (upcoming.length > 0) {
    console.log(chalk.bold('\nUpcoming Assignments:\n'));
    upcoming.slice(0, 10).forEach((a, i) => {
      const dueDateColor = getDueDateColor(a.due_at);
      console.log(`  ${i + 1}. ${a.name}`);
      console.log(`     Due: ${chalk[dueDateColor](formatDate(a.due_at))}\n`);
    });
  }

  console.log(chalk.bold('='.repeat(80) + '\n'));

  // Action menu
  const actions = [
    { name: '1. Open course in browser', value: 'open' },
    { name: '2. View all assignments', value: 'assignments' },
    { name: '3. Return to terminal', value: 'exit' }
  ];

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Choose an action:',
      choices: actions
    }
  ]);

  if (answer.action === 'open') {
    const courseUrl = `${require('../utils/config').getCanvasUrl()}/courses/${course.id}`;
    await open(courseUrl);
    console.log(chalk.green('\n[+] Opened in browser\n'));
  } else if (answer.action === 'assignments') {
    displayAssignmentsList(allAssignments);
  }
}

module.exports = {
  displayAssignmentsList,
  displayAssignmentDetails,
  displayCourseDetails,
  getCourseColor
};
