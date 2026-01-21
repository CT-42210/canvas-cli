# Canvas CLI

A modern command-line interface for any University's Canvas LMS.

## Features

- Secure token-based authentication with auto URL detection
- List assignments with flexible filtering (upcoming, all, due, overdue)
- Interactive course and assignment browsing with arrow key navigation
- File submission support (select class → assignment → file)
- Quick browser integration
- Custom Canvas course colors
- Color-coded due dates (red → yellow → green → blue gradient)
- 24-hour time format support
- Raw API access for advanced users

## Installation

```bash
npm install
npm link
```

This makes the `canvas` command globally available.

## Setup

### Get Your Canvas Token

1. Log into Canvas
2. Go to Account → Settings
3. Scroll to "Approved Integrations"
4. Click "+ New Access Token"
5. Generate token with a descriptive purpose

### Authenticate

```bash
canvas auth
```

The CLI will auto-detect your Canvas URL and store credentials securely in `.env`.

## Commands

### Assignments

```bash
canvas                # Week view - upcoming assignments grouped by week (configurable)
canvas list           # List assignments due in next 3 days
canvas list-all       # List all assignments
canvas list-all-due   # List all upcoming assignments
canvas list-all-overdue # List all overdue assignments
```

### Classes

```bash
canvas class          # Select class, view details (assignments due in 3 days)
canvas class-all      # Select class, view all assignments
```

### Assignment Details

```bash
canvas assignment           # Select class → assignment (uses CANVAS_DEFAULT_DAYS)
canvas assignment -d 7      # Select class → assignment (next 7 days)
canvas assignment -a        # Select class → assignment (all assignments)
```

### Submit Files

```bash
canvas submit         # Interactive file submission
```

Workflow:
1. Select a course
2. Select an assignment (shows assignments due in next 3 days)
3. Option to view all future file-upload assignments if needed
4. Select a file from current directory
5. Confirm and submit

### Utilities

```bash
canvas open           # Open Canvas in browser
canvas raw <endpoint> # Make raw API request
```

Example: `canvas raw /api/v1/courses`

## Project Structure

```
src/
├── commands/      # Command implementations
├── api/          # Canvas API client
├── ui/           # Interactive UI components
└── utils/        # Utilities (config, dates, errors)
```

## Visual Features

### Date Formatting
Due dates display with friendly named days:
- **Today** → "Today at 14:00"
- **Tomorrow** → "Tomorrow at 14:00"
- **Within 7 days** → Day name (e.g., "Sunday at 14:00")
- **Beyond 7 days** → Full date (e.g., "Jan 15, 2025 at 14:00")

### Due Date Colors
Uses a gradient based on days until due:
- **Red** - 1 day or less
- **Red/Yellow** - 1-4 days (gradient)
- **Yellow/Green** - 4-7 days (gradient)
- **Green/Blue** - 7-14 days (gradient)
- **Blue** - 14+ days

### Course Colors
- Uses your custom Canvas course colors
- Consistent across all views
- Falls back to hash-based colors if not set

## Configuration

Settings stored in `~/.canvas-cli/.env`:
- `CANVAS_TOKEN` - Your Canvas API token
- `CANVAS_URL` - Auto-detected Canvas instance URL
- `CANVAS_DEFAULT_DAYS` - Default days for `canvas assignment` filtering (default: 3)
- `CANVAS_WEEK_VIEW_WEEKS` - Additional weeks beyond current week to show (1 = this week + next week, 2 = this week + 2 more weeks, default: 1)
- `CANVAS_WEEK_START` - Day the week starts on (sunday, monday, tuesday, wednesday, thursday, friday, saturday; default: sunday)

## Sorting Behavior

Assignments and courses respect your Canvas dashboard ordering:
- **Week view (`canvas`)**: Grouped by week (configurable start day, default Sunday), then sorted by your dashboard course order, then by due date
- **Course selection**: Courses appear in your dashboard order
- To change the order, drag courses on your Canvas dashboard

**Note:** The `.env` file is gitignored and should never be committed.

## Development

See `outline.txt` for complete project specifications and requirements.

### Key Requirements
- Never truncate error messages - display complete output
- Always verify API response formats before implementing features
- Filter shows only future, unsubmitted assignments by default
- Use arrow key navigation for all interactive selections
