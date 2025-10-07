const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const inquirer = require('inquirer');
const FormData = require('form-data');
const { getCourses, getAssignmentsForCourse, createClient } = require('../api/client');
const { selectCourse, selectFile, confirm } = require('../ui/select');
const { displayError, requireAuth } = require('../utils/errors');
const { sortByDueDate, isDueWithinDays, isDue } = require('../utils/dates');
const config = require('../utils/config');

/**
 * Upload a file to Canvas using their 3-step process
 */
async function uploadFile(client, courseId, assignmentId, filePath) {
  const fileName = path.basename(filePath);
  const fileSize = fs.statSync(filePath).size;

  console.log(chalk.cyan('\n[*] Uploading file...\n'));

  // Step 1: Notify Canvas about file upload
  console.log(chalk.gray('  Step 1: Requesting upload parameters...'));
  const step1Response = await client.post(
    `/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/self/files`,
    {
      name: fileName,
      size: fileSize
    }
  );

  const { upload_url, upload_params } = step1Response.data;

  // Step 2: Upload file data
  console.log(chalk.gray('  Step 2: Uploading file data...'));
  const formData = new FormData();

  // Add all upload params first
  Object.keys(upload_params).forEach(key => {
    formData.append(key, upload_params[key]);
  });

  // Add file last (as per Canvas API docs)
  formData.append('file', fs.createReadStream(filePath));

  const axios = require('axios');
  const uploadResponse = await axios.post(upload_url, formData, {
    headers: formData.getHeaders(),
    maxRedirects: 0,
    validateStatus: (status) => status === 301 || status < 400
  });

  // Step 3: Confirm upload (GET the location URL)
  console.log(chalk.gray('  Step 3: Confirming upload...'));
  const confirmUrl = uploadResponse.headers.location;

  if (!confirmUrl) {
    throw new Error('No location header returned from upload');
  }

  const confirmResponse = await client.get(confirmUrl);

  return confirmResponse.data;
}

/**
 * Submit command - select class, then assignment, then file
 */
async function submitCommand() {
  try {
    requireAuth(config);

    console.log(chalk.cyan('\n[*] Loading courses...\n'));

    // Get all courses
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

    // Get all assignments for the course
    let allAssignments = await getAssignmentsForCourse(selectedCourse.id);

    // Attach course info
    allAssignments = allAssignments.map(a => ({
      ...a,
      course_name: selectedCourse.name,
      course_code: selectedCourse.course_code,
      course_color: selectedCourse.custom_color,
      course_id: selectedCourse.id
    }));

    // Filter to only file upload assignments
    let fileUploadAssignments = allAssignments.filter(a =>
      a.submission_types && a.submission_types.includes('online_upload')
    );

    if (fileUploadAssignments.length === 0) {
      console.log(chalk.yellow('No file upload assignments found for this course'));
      return;
    }

    // Filter to assignments due within 3 days
    const upcomingAssignments = fileUploadAssignments.filter(a => isDueWithinDays(a, 3));
    const allFutureAssignments = fileUploadAssignments.filter(a => isDue(a));

    // Sort both lists
    const sortedUpcoming = sortByDueDate(upcomingAssignments);
    const sortedAll = sortByDueDate(allFutureAssignments);

    // Build assignment choices - first show upcoming, then option to show all
    const assignmentChoices = sortedUpcoming.map(a => ({
      name: `[${a.course_name}] ${a.name} - Due: ${new Date(a.due_at).toLocaleString()}`,
      value: a
    }));

    // Add separator and "Show all future assignments" option if there are more
    if (allFutureAssignments.length > upcomingAssignments.length) {
      assignmentChoices.push(new inquirer.Separator());
      assignmentChoices.push({
        name: `[>] Show all ${allFutureAssignments.length} future file upload assignments`,
        value: '__SHOW_ALL__'
      });
    }

    // Let user select an assignment
    const firstSelection = await inquirer.prompt([
      {
        type: 'list',
        name: 'assignment',
        message: `Select an assignment (showing ${upcomingAssignments.length} due in next 3 days):`,
        choices: assignmentChoices,
        pageSize: 15
      }
    ]);

    let selectedAssignment = firstSelection.assignment;

    // If user selected "show all", display all future assignments
    if (selectedAssignment === '__SHOW_ALL__') {
      const allChoices = sortedAll.map(a => ({
        name: `[${a.course_name}] ${a.name} - Due: ${new Date(a.due_at).toLocaleString()}`,
        value: a
      }));

      const secondSelection = await inquirer.prompt([
        {
          type: 'list',
          name: 'assignment',
          message: 'Select an assignment:',
          choices: allChoices,
          pageSize: 15
        }
      ]);

      selectedAssignment = secondSelection.assignment;
    }

    if (!selectedAssignment) {
      return;
    }

    console.log(chalk.cyan(`\nSelected: ${selectedAssignment.name}`));
    console.log(chalk.gray(`Course: ${selectedAssignment.course_name}\n`));

    // Get files from current directory
    const currentDir = process.cwd();
    const files = fs.readdirSync(currentDir).filter(file => {
      const stat = fs.statSync(path.join(currentDir, file));
      return stat.isFile() && !file.startsWith('.');
    });

    if (files.length === 0) {
      console.log(chalk.yellow('No files found in current directory'));
      return;
    }

    // Let user select a file
    const selectedFile = await selectFile(files);

    if (!selectedFile) {
      return;
    }

    const filePath = path.join(currentDir, selectedFile);

    console.log(chalk.cyan(`\nFile to submit: ${selectedFile}`));
    console.log(chalk.gray(`Path: ${filePath}`));

    // Confirm submission
    const confirmed = await confirm('\nSubmit this file?');

    if (!confirmed) {
      console.log(chalk.yellow('\nSubmission cancelled\n'));
      return;
    }

    // Upload and submit the file
    const client = createClient();
    await uploadFile(client, selectedAssignment.course_id, selectedAssignment.id, filePath);

    console.log(chalk.green('\n[+] File submitted successfully!\n'));

  } catch (error) {
    displayError(error);
    process.exit(1);
  }
}

module.exports = submitCommand;
