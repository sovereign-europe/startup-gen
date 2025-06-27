# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CLI tool called "Startup CLI" that helps early-stage startups build using lean startup methodology. The tool provides two main commands:

1. **`startup init`** - Initializes a new startup project with proper structure, git repo, and environment setup
2. **`startup build customer-segment`** - Creates AI-generated customer personas using OpenAI API

## Development Commands

### Building and Testing
- `npm run build` - Build the CLI tool using Vite
- `npm run dev` - Build in watch mode for development
- `npm test` - Run all tests using Vitest
- `npm run test:watch` - Run tests in watch mode
- `vitest run src/commands/__tests__/init.test.ts` - Run a single test file

### Code Quality
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint on source files
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Running the CLI
- `npm start init` - Initialize a new startup project
- `npm start build customer-segment` - Create customer segment persona
- `node dist/index.js <command>` - Run built CLI directly

## Architecture

### Command Structure
The CLI uses Commander.js with a hierarchical command structure:
- Main entry point: `src/index.ts`
- Commands are organized in `src/commands/` directory
- Each command is a separate module that exports async functions
- Error handling is centralized in the main CLI wrapper

### Key Components

**CLI Framework**: Uses Commander.js for command parsing and help generation. Commands are defined with async action handlers that catch errors and provide user-friendly messages.

**Interactive Prompts**: Uses Inquirer.js for user input. The init command prompts for startup name and OpenAI API key, while customer-segment prompts for customer definitions.

**AI Integration**: Uses OpenAI API (gpt-3.5-turbo) to generate detailed customer personas. API key is stored in `.env` file and validated before use.

**File Management**: Uses fs-extra for enhanced file operations. The init command creates README.md, .env, and .gitignore files with specific content templates.

**Git Integration**: Automatically initializes git repositories and commits files with meaningful commit messages using execSync.

### Build System
- **Vite** is used as the build tool configured for Node.js library output
- Builds to CommonJS format in `dist/` directory
- External dependencies are not bundled (inquirer, commander, openai, etc.)
- Uses `interop: 'auto'` for proper ES module compatibility

### Testing
- **Vitest** for testing framework
- Tests mock external dependencies (fs-extra, child_process, inquirer, openai)
- Tests focus on command behavior and file creation rather than implementation details

## OpenAI Integration Details

The customer-segment command generates personas by:
1. Validating `.env` file exists (created by init command)
2. Prompting user for customer definition and refinements
3. Sending structured prompt to OpenAI API requesting detailed persona with demographics, psychographics, pain points, goals, etc.
4. Extracting persona name from AI response using regex patterns
5. Creating markdown file named `customer-segment-{persona-name}.md`
6. Committing the file to git with user input as commit message

## Environment Setup

The tool requires:
- Node.js 16+
- OpenAI API key (stored in `.env` file)
- Git (for repository operations)

The init command handles environment setup by creating the `.env` file and `.gitignore` to exclude it from version control.