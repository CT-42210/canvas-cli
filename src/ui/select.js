const inquirer = require('inquirer');
const chalk = require('chalk');

/**
 * Display an interactive selection menu
 * Uses arrow keys to navigate, enter/space to select
 */
async function select(message, choices) {
  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'selection',
      message: message,
      choices: choices,
      pageSize: 15
    }
  ]);

  return answer.selection;
}

/**
 * Select a course from a list
 */
async function selectCourse(courses) {
  if (courses.length === 0) {
    console.log(chalk.yellow('No courses found'));
    return null;
  }

  const choices = courses.map(course => ({
    name: `${course.name} (${course.course_code})`,
    value: course
  }));

  return await select('Select a course:', choices);
}

/**
 * Select an assignment from a list
 */
async function selectAssignment(assignments) {
  if (assignments.length === 0) {
    console.log(chalk.yellow('No assignments found'));
    return null;
  }

  const choices = assignments.map(assignment => ({
    name: `[${assignment.course_name}] ${assignment.name}`,
    value: assignment
  }));

  return await select('Select an assignment:', choices);
}

/**
 * Select a file from the current directory
 */
async function selectFile(files) {
  if (files.length === 0) {
    console.log(chalk.yellow('No files found in current directory'));
    return null;
  }

  const choices = files.map(file => ({
    name: file,
    value: file
  }));

  return await select('Select a file to submit:', choices);
}

/**
 * Confirm an action
 */
async function confirm(message) {
  const answer = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: message,
      default: false
    }
  ]);

  return answer.confirmed;
}

module.exports = {
  select,
  selectCourse,
  selectAssignment,
  selectFile,
  confirm
};
