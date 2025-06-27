# Startup CLI

A CLI tool for early-stage startups to build lean startup methodology. This tool helps entrepreneurs systematically approach building their startup using proven lean startup principles.

## Features

- **Project Initialization**: Set up a new startup project with proper structure
- **Customer Segment Analysis**: Create detailed customer personas using AI
- **Git Integration**: Automatic version control with meaningful commits
- **Extensible Architecture**: Built to support additional lean startup methodologies

## Installation

```bash
npm install
npm run build
```

## Usage

### Initialize a New Startup Project

```bash
npm start init
```

This command will:
- Prompt for your startup name
- Request your OpenAI API key for AI-powered features
- Create a README.md file for your startup
- Set up environment variables
- Create a .gitignore file
- Initialize a git repository
- Commit initial files
- Optionally launch the customer segment builder

### Build Customer Segments

```bash
npm start build customer-segment
```

This command will:
- Prompt for high-level customer definition
- Allow additional refinements
- Generate a detailed customer persona using AI
- Create a markdown file with the persona
- Commit the persona to git

## Development

### Scripts

- `npm run build` - Build the CLI tool
- `npm run dev` - Build in watch mode
- `npm test` - Run tests
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Project Structure

```
src/
├── index.ts              # Main CLI entry point
├── commands/
│   ├── init.ts          # Initialization command
│   ├── build.ts         # Build commands (customer-segment)
│   └── __tests__/       # Test files
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Build configuration
└── .eslintrc.js         # Linting rules
```

## Tech Stack

- **Node.js** with **TypeScript** for robust development
- **Commander.js** for CLI framework and command structure
- **Inquirer.js** for interactive prompts and user input
- **Vite** for fast building and development
- **Vitest** for testing framework
- **OpenAI API** for AI-powered persona generation
- **ESLint** and **Prettier** for code quality

## Requirements

- Node.js 16+
- OpenAI API key for customer segment generation

## License

MIT
