import inquirer from "inquirer"
import fs from "fs-extra"
import { execSync } from "child_process"
import OpenAI from "openai"
import * as dotenv from "dotenv"

export async function generateProblemAnalysis() {
	dotenv.config()

	try {
		if (!(await fs.pathExists(".env"))) {
			throw new Error(
				'No .env file found. Please run "startup init" first to set up your project.',
			)
		}

		console.log("🔍 Let's identify the top 3 problems your startup needs to solve!")
		console.log("We'll analyze the most critical problems and prioritize them for your solution.\n")

		const answers = await inquirer.prompt([
			{
				type: "input",
				name: "productIdea",
				message: "What product or service are you building?",
				validate: (input: string) =>
					input.trim().length > 0 || "Please describe your product idea",
			},
			{
				type: "input",
				name: "targetCustomer",
				message: "Who is your target customer?",
				validate: (input: string) =>
					input.trim().length > 0 || "Please describe your target customer",
			},
			{
				type: "input",
				name: "initialProblems",
				message: "What problems do you think your customers face? (comma-separated):",
				validate: (input: string) =>
					input.trim().length > 0 || "Please list some problems",
			},
			{
				type: "input",
				name: "additionalContext",
				message: "Any additional context about the market or customer pain points? (optional):",
				default: "",
			},
		])

		const { productIdea, targetCustomer, initialProblems, additionalContext } = answers

		console.log("\n🤖 Analyzing and prioritizing problems...")

		const problemAnalysis = await generateProblemAnalysisContent(
			productIdea,
			targetCustomer,
			initialProblems,
			additionalContext,
		)

		const fileName = `problem-analysis-${Date.now()}.md`

		await fs.writeFile(fileName, problemAnalysis)
		console.log(`📄 Created ${fileName}`)

		await commitProblemFile(fileName, productIdea, targetCustomer)

		console.log("\n✅ Problem analysis created successfully!")
		console.log(`📖 Check out ${fileName} for your prioritized problem breakdown.`)
	} catch (error) {
		console.error("Error creating problem analysis:", error)
		process.exit(1)
	}
}

async function generateProblemAnalysisContent(
	productIdea: string,
	targetCustomer: string,
	initialProblems: string,
	additionalContext: string,
): Promise<string> {
	const apiKey = process.env.OPENAI_API_KEY
	if (!apiKey) {
		throw new Error(
			'OpenAI API key not found. Please run "startup init" first.',
		)
	}

	const openai = new OpenAI({ apiKey })

	const prompt = `Create a comprehensive problem analysis for a startup, identifying and prioritizing the top 3 problems that need to be solved. Based on the following context:

**Product/Service:** ${productIdea}
**Target Customer:** ${targetCustomer}
**Initial Problems Identified:** ${initialProblems}
${additionalContext ? `**Additional Context:** ${additionalContext}` : ""}

### The analysis must include the following sections:

1. **Problem Overview**: A brief summary of the problem space and why it matters
2. **Top 3 Problems (Prioritized)**:
   - **Problem #1**: [Most Critical Problem]
     - Description and impact
     - Why it's the highest priority
     - Evidence of the problem's severity
   - **Problem #2**: [Second Most Critical Problem]
     - Description and impact
     - Why it's the second priority
     - Evidence of the problem's severity
   - **Problem #3**: [Third Most Critical Problem]
     - Description and impact
     - Why it's the third priority
     - Evidence of the problem's severity

3. **Problem Validation**: How to validate these problems with real customers
4. **Problem-Solution Fit**: How your product addresses each problem
5. **Competitive Analysis**: How existing solutions fail to solve these problems
6. **Market Opportunity**: The size and urgency of solving these problems
7. **Next Steps**: Recommended actions to validate and prioritize these problems

### Requirements:
- Focus on problems that are painful, frequent, and urgent
- Include specific examples and evidence where possible
- Prioritize based on customer impact and business opportunity
- Format as a clean, structured Markdown document
- Make each problem actionable and measurable
- Consider both emotional and practical aspects of each problem`

	const response = await openai.chat.completions.create({
		model: "gpt-3.5-turbo",
		messages: [{ role: "user", content: prompt }],
		max_tokens: 1500,
		temperature: 0.7,
	})

	return response.choices[0]?.message?.content || "Error generating problem analysis"
}

async function commitProblemFile(
	fileName: string,
	productIdea: string,
	targetCustomer: string,
) {
	try {
		execSync(`git add ${fileName}`, { stdio: "ignore" })

		const commitMessage = `Add problem analysis: ${productIdea} - ${targetCustomer}`

		execSync(`git commit -m "${commitMessage}"`, { stdio: "ignore" })
		console.log("💾 Committed problem analysis file")
	} catch {
		console.log("⚠️  Could not commit file (git may not be configured)")
	}
} 