1. Install Dependencies

Go to the root folder of the project and run:

npm install


This will install all required dependencies.

2. Run the Project

Start the development server with:

npm run dev




# SCA Auto Annotation

A fully functional VS Code-style editor specifically designed for C and C++ development.

## Features

### Real Folder Import
- Import any folder from your local filesystem using the File System Access API
- Display actual folder structure with proper hierarchy
- Expand/collapse folders with arrow indicators
- Nested folder support with proper indentation

###  Code Editor
- Powered by Monaco Editor (VS Code engine)
- Full syntax highlighting for C/C++ files
- Line numbers
- Auto-save when switching files
- Multiple file tabs support
- Custom VS Code dark theme matching the reference

### Syntax Highlighting
- **Cyan** - Include directives
- **Yellow** - Strings
- **Purple** - Keywords (void, int, return, etc.)
- **Teal** - Types (char, etc.)
- **Gray** - Comments
- **Light Yellow** - Functions

### Tab Management
- Open multiple files in tabs
- Click to switch between files
- Close button (X) on each tab
- Tab state persisted to localStorage

###  AI Annotation Suggestions Panel
- Collapsible bottom panel
- Displays code improvement suggestions
- Accept/Edit/Reject buttons for each suggestion
- Example suggestions included:
  - Buffer overflow warnings
  - Null pointer checks
  - Code complexity reduction

###  Status Bar
- Current line and column position
- Indentation settings (Spaces: 4)
- File encoding (UTF-8)
- Current language (C/C++)
- VS Code blue theme

###  UI Components
- **Toolbar**: File explorer, search, and settings icons
- **Sidebar**: Collapsible folder explorer with toggle
- **Editor Area**: Full-featured code editor
- **Tab Bar**: File tabs with close buttons
- **AI Panel**: Collapsible suggestions panel
- **Status Bar**: Editor status information

###  Persistence
- Open files stored in localStorage
- Active file state persisted
- Reopening preserves tabs and content

## How to Use

1. **Import a Folder**: Click the upload icon in the sidebar or the "Import Folder" button
2. **Navigate**: Click folders to expand/collapse, click .c or .cpp files to open them
3. **Edit**: Make changes in the Monaco editor
4. **Switch Files**: Click tabs to switch between open files
5. **Close Files**: Click the X button on tabs to close files
6. **Toggle Sidebar**: Click the folder icon in the toolbar
7. **View Suggestions**: Review AI suggestions in the bottom panel
8. **Toggle AI Panel**: Click the collapse/expand button on the AI suggestions panel

## Keyboard Shortcuts (Monaco Editor)

The editor inherits all standard Monaco Editor shortcuts:
- **Ctrl+F / Cmd+F**: Find
- **Ctrl+H / Cmd+H**: Replace
- **Ctrl+S / Cmd+S**: Save (auto-saves on file switch)
- **Ctrl+Z / Cmd+Z**: Undo
- **Ctrl+Y / Cmd+Y**: Redo
- **Ctrl+/ / Cmd+/**: Toggle line comment
- **Ctrl+D / Cmd+D**: Add selection to next find match
- **Alt+Up/Down**: Move line up/down
- **Shift+Alt+Up/Down**: Copy line up/down

## Test the Application

To test the application without a C/C++ project:

1. Create a new folder on your computer (e.g., "test-project")
2. Add some sample C/C++ files,
3. Create a subfolder (e.g., "include") with header files
4. Import the folder using the application
5. Navigate and edit your files!


## Technical Stack

- React
- TypeScript
- Monaco Editor (@monaco-editor/react)
- Tailwind CSS
- Lucide Icons
- File System Access API