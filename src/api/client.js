const axios = require('axios');
const config = require('../utils/config');

/**
 * Create Canvas API client
 */
function createClient() {
  const token = config.getToken();
  const baseUrl = config.getCanvasUrl();

  if (!token || !baseUrl) {
    throw new Error('Not authenticated. Run: canvas auth');
  }

  return axios.create({
    baseURL: baseUrl,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
}

/**
 * Get user's custom course colors
 */
async function getUserColors() {
  const client = createClient();
  const response = await client.get('/api/v1/users/self/colors');
  return response.data.custom_colors || {};
}

/**
 * Get all active courses with custom colors
 */
async function getCourses() {
  const client = createClient();
  const [coursesResponse, customColors] = await Promise.all([
    client.get('/api/v1/courses', {
      params: {
        enrollment_state: 'active',
        include: ['term', 'total_scores'],
        per_page: 100
      }
    }),
    getUserColors()
  ]);

  // Attach custom colors to courses
  return coursesResponse.data.map(course => ({
    ...course,
    custom_color: customColors[`course_${course.id}`] || null
  }));
}

/**
 * Get assignments for a specific course
 */
async function getAssignmentsForCourse(courseId) {
  const client = createClient();
  const response = await client.get(`/api/v1/courses/${courseId}/assignments`, {
    params: {
      per_page: 100
    }
  });
  return response.data;
}

/**
 * Get all assignments across all active courses
 * Returns array of assignments with course info attached
 */
async function getAllAssignments() {
  const courses = await getCourses();
  const allAssignments = [];

  for (const course of courses) {
    try {
      const assignments = await getAssignmentsForCourse(course.id);

      // Attach course info to each assignment
      assignments.forEach(assignment => {
        allAssignments.push({
          ...assignment,
          course_name: course.name,
          course_code: course.course_code,
          course_color: course.custom_color,
          course_id: course.id
        });
      });
    } catch (error) {
      // Skip courses that error (might be empty or restricted)
      continue;
    }
  }

  return allAssignments;
}

/**
 * Get user info
 */
async function getUserInfo() {
  const client = createClient();
  const response = await client.get('/api/v1/users/self');
  return response.data;
}

/**
 * Make a raw API call
 */
async function makeRawRequest(endpoint) {
  const client = createClient();
  const response = await client.get(endpoint);
  return response.data;
}

module.exports = {
  createClient,
  getCourses,
  getAssignmentsForCourse,
  getAllAssignments,
  getUserInfo,
  makeRawRequest
};
