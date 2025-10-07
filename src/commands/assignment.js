const chalk = require('chalk');
const { getCourses, getAssignmentsForCourse } = require('../api/client');
const { selectCourse, selectAssignment } = require('../ui/select');
const { displayAssignmentDetails } = require('../ui/display');
const { displayError, requireAuth } = require('../utils/errors');
const { isDueWithinDays, sortByDueDate } = require('../utils/dates');
const config = require('../utils/config');

/**
 * Assignment command - select course, then assignment, then view details
 */
async function assignmentCommand(options) {
  try {
    requireAuth(config);

    console.log(chalk.cyan('\n[*] Loading courses...\n'));

    const courses = await getCourses();

    if (courses.length === 0) {
      console.log(chalk.yellow('No courses found'));
      return;
    }

    // Let user select a course
    const selectedCourse = await selectCourse(courses);

    if (!selectedCourse) {
      return;
    }

    console.log(chalk.cyan('\n[*] Loading assignments...\n'));

    // Get assignments for the course
    let assignments = await getAssignmentsForCourse(selectedCourse.id);

    // Attach course info to assignments first
    assignments = assignments.map(a => ({
      ...a,
      course_name: selectedCourse.name,
      course_code: selectedCourse.course_code,
      course_color: selectedCourse.custom_color,
      course_id: selectedCourse.id
    }));

    // Filter based on options
    if (!options.all) {
      // Default: only show assignments due within 3 days
      assignments = assignments.filter(a => isDueWithinDays(a, 3));
    }

    if (assignments.length === 0) {
      console.log(chalk.yellow('No assignments found'));
      return;
    }

    // Sort assignments by due date
    assignments = sortByDueDate(assignments);

    // Let user select an assignment
    const selectedAssignment = await selectAssignment(assignments);

    if (!selectedAssignment) {
      return;
    }

    // Display assignment details
    await displayAssignmentDetails(selectedAssignment);

  } catch (error) {
    displayError(error);
    process.exit(1);
  }
}

module.exports = assignmentCommand;
