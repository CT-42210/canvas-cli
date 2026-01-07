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
 * Interpolate between two hex color components
 */
function lerp(start, end, t) {
  return Math.round(start + (end - start) * t);
}

/**
 * Get color for due date based on urgency (gradient from green to yellow to red)
 * - 13+ days out: pure green (#00FF00)
 * - 7 days out: pure yellow (#FFFF00)
 * - 1 day or less: pure red (#FF0000)
 * Returns a hex color string
 */
function getDueDateColor(dateString) {
  if (!dateString) return '#5FAF5F'; // soft green for no due date

  const date = new Date(dateString);
  const now = new Date();

  // Calculate days until due
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysUntilDue = (date - now) / msPerDay;

  // Define color stops (muted/subtle tones)
  const red = { r: 215, g: 95, b: 95 };      // #D75F5F - soft red
  const yellow = { r: 215, g: 175, b: 95 };  // #D7AF5F - soft amber
  const green = { r: 95, g: 175, b: 95 };    // #5FAF5F - soft green

  let r, g, b;

  if (daysUntilDue <= 1) {
    // Pure red for 1 day or less
    r = red.r; g = red.g; b = red.b;
  } else if (daysUntilDue <= 7) {
    // Gradient from red (1 day) to yellow (7 days)
    const t = (daysUntilDue - 1) / 6; // 0 at 1 day, 1 at 7 days
    r = lerp(red.r, yellow.r, t);
    g = lerp(red.g, yellow.g, t);
    b = lerp(red.b, yellow.b, t);
  } else if (daysUntilDue <= 13) {
    // Gradient from yellow (7 days) to green (13 days)
    const t = (daysUntilDue - 7) / 6; // 0 at 7 days, 1 at 13 days
    r = lerp(yellow.r, green.r, t);
    g = lerp(yellow.g, green.g, t);
    b = lerp(yellow.b, green.b, t);
  } else {
    // Pure green for 13+ days
    r = green.r; g = green.g; b = green.b;
  }

  // Convert to hex
  const toHex = (n) => n.toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Get the start of the week for a given date (configurable via CANVAS_WEEK_START)
 */
function getWeekStart(date) {
  const { getWeekStartDay } = require('./config');
  const weekStartDay = getWeekStartDay();

  const d = new Date(date);
  const day = d.getDay();
  // Calculate days to go back to reach the week start day
  const diff = (day - weekStartDay + 7) % 7;
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of the week for a given date (configurable via CANVAS_WEEK_START)
 */
function getWeekEnd(date) {
  const { getWeekStartDay } = require('./config');
  const weekStartDay = getWeekStartDay();
  // Week ends the day before the next week starts
  const weekEndDay = (weekStartDay + 6) % 7;

  const d = new Date(date);
  const day = d.getDay();
  // Calculate days to go forward to reach the week end day
  const diff = (weekEndDay - day + 7) % 7;
  d.setDate(d.getDate() + diff);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Format a week range for display (e.g., "Jan 6-12" or "Jan 27 - Feb 2")
 */
function formatWeekRange(weekStart) {
  const weekEnd = getWeekEnd(weekStart);
  const startMonth = weekStart.toLocaleDateString(undefined, { month: 'short' });
  const endMonth = weekEnd.toLocaleDateString(undefined, { month: 'short' });
  const startDay = weekStart.getDate();
  const endDay = weekEnd.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  }
}

/**
 * Get week label for display (e.g., "This Week", "Next Week", or date range)
 */
function getWeekLabel(weekStart) {
  const now = new Date();
  const thisWeekStart = getWeekStart(now);
  const nextWeekStart = new Date(thisWeekStart);
  nextWeekStart.setDate(nextWeekStart.getDate() + 7);

  if (weekStart.getTime() === thisWeekStart.getTime()) {
    return `This Week (${formatWeekRange(weekStart)})`;
  } else if (weekStart.getTime() === nextWeekStart.getTime()) {
    return `Next Week (${formatWeekRange(weekStart)})`;
  } else {
    return formatWeekRange(weekStart);
  }
}

/**
 * Sort assignments by course position first, then by due date
 */
function sortByCoursePositionThenDate(assignments) {
  return assignments.sort((a, b) => {
    // First sort by course position (lower = higher priority)
    const posA = a.course_position ?? 999;
    const posB = b.course_position ?? 999;
    if (posA !== posB) return posA - posB;

    // Then sort by due date
    if (!a.due_at && !b.due_at) return 0;
    if (!a.due_at) return 1;
    if (!b.due_at) return -1;
    return new Date(a.due_at) - new Date(b.due_at);
  });
}

/**
 * Group assignments by week
 */
function groupByWeek(assignments) {
  const groups = new Map();

  assignments.forEach(assignment => {
    if (!assignment.due_at) return;

    const dueDate = new Date(assignment.due_at);
    const weekStart = getWeekStart(dueDate);
    const key = weekStart.getTime();

    if (!groups.has(key)) {
      groups.set(key, {
        weekStart,
        label: getWeekLabel(weekStart),
        assignments: []
      });
    }

    groups.get(key).assignments.push(assignment);
  });

  // Sort weeks chronologically, then sort assignments within each week
  const sortedWeeks = Array.from(groups.values()).sort((a, b) => a.weekStart - b.weekStart);

  // Sort assignments within each week by course position, then due date
  sortedWeeks.forEach(week => {
    week.assignments = sortByCoursePositionThenDate(week.assignments);
  });

  return sortedWeeks;
}

module.exports = {
  isDueWithinDays,
  isOverdue,
  isDue,
  sortByDueDate,
  formatDate,
  getDueDateColor,
  getWeekStart,
  getWeekEnd,
  formatWeekRange,
  getWeekLabel,
  groupByWeek
};
