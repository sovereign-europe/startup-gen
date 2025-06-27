import inquirer from "inquirer"
import fs from "fs-extra"
import { execSync } from "child_process"
import { join } from "path"
import OpenAI from "openai"
import * as dotenv from "dotenv"

export async function generateCustomerSegment() {
	dotenv.config()

	try {
		if (!(await fs.pathExists(".env"))) {
			throw new Error(
				'No .env file found. Please run "startup init" first to set up your project.',
			)
		}

		console.log("🎯 Let's build your customer segment!")
		console.log(
			"We'll create a detailed persona to help guide your startup decisions.\n",
		)

		const answers = await inquirer.prompt([
			{
				type: "input",
				name: "highLevelDefinition",
				message: "Provide a high-level definition of your target customer:",
				validate: (input: string) =>
					input.trim().length > 0 || "Please provide a customer definition",
			},
			{
				type: "input",
				name: "additionalRefinement",
				message:
					"Any additional refinements or specific details? (optional):",
				default: "",
			},
		])

		const { highLevelDefinition, additionalRefinement } = answers

		console.log("\n🤖 Generating detailed customer persona...")

		const persona = await generatePersona(
			highLevelDefinition,
			additionalRefinement,
		)
		const personaName = extractPersonaName(persona)
		const fileName = `customer-segment-${personaName.toLowerCase().replace(/\s+/g, "-")}.md`

		await fs.writeFile(fileName, persona)
		console.log(`📄 Created ${fileName}`)

		await commitPersonaFile(
			fileName,
			highLevelDefinition,
			additionalRefinement,
		)

		console.log("\n✅ Customer segment created successfully!")
		console.log(`📖 Check out ${fileName} for your detailed persona.`)
	} catch (error) {
		console.error("Error creating customer segment:", error)
		process.exit(1)
	}
}

async function generatePersona(
	highLevelDefinition: string,
	additionalRefinement: string,
): Promise<string> {
	const apiKey = process.env.OPENAI_API_KEY
	if (!apiKey) {
		throw new Error(
			'OpenAI API key not found. Please run "startup init" first.',
		)
	}

	const openai = new OpenAI({ apiKey })

	const promptTemplate = await fs.readFile(
		join(process.cwd(), "prompts", "customer-persona.txt"),
		"utf-8",
	)

	const prompt = promptTemplate
		.replace("{{highLevelDefinition}}", highLevelDefinition)
		.replace(
			"{{additionalRefinement}}",
			additionalRefinement
				? `**Additional nuance or product context:** ${additionalRefinement}`
				: "",
		)

	const response = await openai.chat.completions.create({
		model: "gpt-3.5-turbo",
		messages: [{ role: "user", content: prompt }],
		max_tokens: 1500,
		temperature: 0.7,
	})

	return response.choices[0]?.message?.content || "Error generating persona"
}

function extractPersonaName(persona: string): string {
	const nameMatch = persona.match(
		/(?:Name|Persona Name|Meet)\s*:?\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/i,
	)
	if (nameMatch) {
		return nameMatch[1]
	}

	const firstLineMatch = persona
		.split("\n")[0]
		.match(/([A-Z][a-z]+\s+[A-Z][a-z]+)/)
	if (firstLineMatch) {
		return firstLineMatch[1]
	}

	return "Customer-Persona"
}

async function commitPersonaFile(
	fileName: string,
	highLevelDefinition: string,
	additionalRefinement: string,
) {
	try {
		execSync(`git add ${fileName}`, { stdio: "ignore" })

		const commitMessage = additionalRefinement
			? `Add customer segment: ${highLevelDefinition} - ${additionalRefinement}`
			: `Add customer segment: ${highLevelDefinition}`

		execSync(`git commit -m "${commitMessage}"`, { stdio: "ignore" })
		console.log("💾 Committed customer segment file")
	} catch {
		console.log("⚠️  Could not commit file (git may not be configured)")
	}
} 