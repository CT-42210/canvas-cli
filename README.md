# Canvas CLI

A modern command-line interface for any University's Canvas LMS.

## Features

- Secure token-based authentication with auto URL detection
- List assignments with flexible filtering (upcoming, all, due, overdue)
- Interactive course and assignment browsing with arrow key navigation
- File submission support (select class → assignment → file)
- Quick browser integration
- Custom Canvas course colors
- Color-coded due dates (red = today, yellow = tomorrow, green = later)
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
canvas                # List assignments due in next 3 days (default)
canvas list           # Same as above
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
canvas assignment     # Select class → assignment (next 3 days)
canvas assignment-all # Select class → assignment (all assignments)
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

### Due Date Colors
- **Red** - Due today
- **Yellow** - Due tomorrow
- **Green** - Due later

### Course Colors
- Uses your custom Canvas course colors
- Consistent across all views
- Falls back to hash-based colors if not set

## Configuration

Settings stored in `.env`:
- `CANVAS_TOKEN` - Your Canvas API token
- `CANVAS_URL` - Auto-detected Canvas instance URL

**Note:** The `.env` file is gitignored and should never be committed.

## Development

See `outline.txt` for complete project specifications and requirements.

### Key Requirements
- Never truncate error messages - display complete output
- Always verify API response formats before implementing features
- Filter shows only future, unsubmitted assignments by default
- Use arrow key navigation for all interactive selections
