/*
 * Copyright 2025 Negative Space Software
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
 * Returns object with assignments array and skippedCourses array
 */
async function getAllAssignments() {
  const courses = await getCourses();
  const allAssignments = [];
  const skippedCourses = [];

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
      // Track courses that error due to 403 (API access restricted)
      if (error.response && error.response.status === 403) {
        skippedCourses.push(course.name);
      }
      continue;
    }
  }

  return { assignments: allAssignments, skippedCourses };
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
