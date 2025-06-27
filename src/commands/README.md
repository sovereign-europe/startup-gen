# Build Commands

This directory contains the build commands for the startup CLI tool. The build system has been refactored to be modular and extensible.

## Structure

- `build.ts` - Main build command orchestrator
- `customer-segment.ts` - Customer segment generation functionality
- `build-steps-template.ts` - Template for creating new build steps
- `init.ts` - Project initialization functionality

## How to Add New Build Steps

### 1. Create a new build step file

Create a new file in this directory (e.g., `market-analysis.ts`) following the pattern from `customer-segment.ts`:

```typescript
import inquirer from "inquirer"
import fs from "fs-extra"
import { execSync } from "child_process"
import OpenAI from "openai"
import * as dotenv from "dotenv"

export async function generateMarketAnalysis() {
  // Implementation here
}
```

### 2. Add the build step to build.ts

Update the `buildCommand.run()` method in `build.ts` to include your new step:

```typescript
const { buildStep } = await inquirer.prompt([
  {
    type: "list",
    name: "buildStep",
    message: "What would you like to build?",
    choices: [
      // ... existing choices
      {
        name: "📊 Market Analysis - Analyze your market opportunity",
        value: "market-analysis",
      },
    ],
  },
])
```

### 3. Add the case to executeBuildStep

Add a case for your new step in the `executeBuildStep` method:

```typescript
async executeBuildStep(step: string) {
  switch (step) {
    // ... existing cases
    case "market-analysis":
      await generateMarketAnalysis()
      break
    default:
      console.error("Unknown build step:", step)
      process.exit(1)
  }
}
```

### 4. Import your function

Add the import at the top of `build.ts`:

```typescript
import { generateMarketAnalysis } from "./market-analysis"
```

## Build Step Template

Use `build-steps-template.ts` as a reference for creating new build steps. It includes:

- Standard error handling
- Environment validation
- User input collection
- OpenAI integration
- File generation
- Git commit functionality

## Best Practices

1. **Consistent naming**: Use descriptive function names like `generate[FeatureName]`
2. **Error handling**: Always include proper try-catch blocks
3. **User feedback**: Provide clear console output for user actions
4. **File naming**: Use consistent file naming patterns
5. **Git integration**: Include automatic git commit functionality
6. **Validation**: Validate user inputs and environment setup

## Available Build Steps

- **Customer Segment**: Create detailed customer personas
- **Market Analysis**: Analyze market opportunity (template provided)
- **Value Proposition**: Define unique value (coming soon)
- **Business Model**: Design business model (coming soon)
- **Go-to-Market Strategy**: Plan launch strategy (coming soon)
