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

/**
 * Filter assignments by due date criteria
 */

/**
 * Check if an assignment is due within the next N days
 */
function isDueWithinDays(assignment, days) {
  if (!assignment.due_at) return false;

  const now = new Date();
  const dueDate = new Date(assignment.due_at);
  const daysFromNow = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

  // Only show if within range and in the future
  return dueDate >= now && dueDate <= daysFromNow;
}

/**
 * Check if an assignment is overdue
 */
function isOverdue(assignment) {
  if (!assignment.due_at) return false;

  const now = new Date();
  const dueDate = new Date(assignment.due_at);

  // Consider it overdue only if past due and not submitted
  return dueDate < now && !assignment.has_submitted_submissions;
}

/**
 * Check if an assignment is due (has a due date in the future)
 */
function isDue(assignment) {
  if (!assignment.due_at) return false;

  const now = new Date();
  const dueDate = new Date(assignment.due_at);

  // Only show if due in future
  return dueDate >= now;
}

/**
 * Sort assignments by due date (earliest first), then by course name
 */
function sortByDueDate(assignments) {
  return assignments.sort((a, b) => {
    // Assignments without due dates go to the end
    if (!a.due_at && !b.due_at) return a.course_name.localeCompare(b.course_name);
    if (!a.due_at) return 1;
    if (!b.due_at) return -1;

    // Sort by due date
    const dateA = new Date(a.due_at);
    const dateB = new Date(b.due_at);

    if (dateA.getTime() === dateB.getTime()) {
      // If same due date, sort by course name
      return a.course_name.localeCompare(b.course_name);
    }

    return dateA - dateB;
  });
}

/**
 * Format a date for display using system locale and format settings
 */
function formatDate(dateString) {
  if (!dateString) return 'No due date';

  const date = new Date(dateString);
  const now = new Date();

  // Use system default locale with 24-hour format
  const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
  const dateTimeOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };

  // Check if it's today
  if (date.toDateString() === now.toDateString()) {
    return `Today at ${date.toLocaleTimeString(undefined, timeOptions)}`;
  }

  // Check if it's tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow at ${date.toLocaleTimeString(undefined, timeOptions)}`;
  }

  // Otherwise show full date and time using system default
  return date.toLocaleString(undefined, dateTimeOptions);
}

/**
 * Get color for due date based on urgency
 * - Today: red
 * - Tomorrow: yellow
 * - All else: green
 */
function getDueDateColor(dateString) {
  if (!dateString) return 'green';

  const date = new Date(dateString);
  const now = new Date();

  // Check if it's today
  if (date.toDateString() === now.toDateString()) {
    return 'red';
  }

  // Check if it's tomorrow
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === tomorrow.toDateString()) {
    return 'yellow';
  }

  // Everything else
  return 'green';
}

module.exports = {
  isDueWithinDays,
  isOverdue,
  isDue,
  sortByDueDate,
  formatDate,
  getDueDateColor
};
