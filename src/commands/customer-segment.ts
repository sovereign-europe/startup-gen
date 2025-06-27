import inquirer from "inquirer"
import fs from "fs-extra"
import { execSync } from "child_process"
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

	const prompt = `Create a detailed and highly realistic customer persona for a lean startup, based on the following context:

**High-level customer definition:** ${highLevelDefinition}
${additionalRefinement ? `**Additional nuance or product context:** ${additionalRefinement}` : ""}

Your output must describe one believable individual—not a generalized user type. Write with vivid specificity.

### The persona must include the following sections:

1. **Name**: A realistic full name.
2. **Demographics**: Age, location, job title, seniority, and income range.
3. **Psychographics**: Values, interests, and lifestyle—focus on motivations, not generic traits.
4. **Pain Points & Frustrations**: Make them emotionally resonant and behaviorally observable. What keeps them stuck?
5. **Contradictions & Tensions**: What makes this person complex or even contradictory? Include at least two (e.g., loves new tools but still takes handwritten notes).
6. **Goals & Motivations**: What are they striving for? Include emotional and practical dimensions.
7. **Buying Behavior**: How do they evaluate, decide, and justify purchases? Include how they research, what turns them off, and what builds trust.
8. **Communication Preferences**: Where and how do they prefer to engage with content or products?
9. **Tech Adoption Style**: Are they an early tinkerer, late pragmatist, reluctant skeptic? Add an example of a recent tool they adopted (or abandoned).
10. **Edge Cases**: At least three specific, unexpected behaviors, tools, or values that make them memorable or unique.
11. **Quote**: Include a quote that summarizes how they think or make decisions.
12. **Day in the Life**: Walk through a weekday with a focus on friction, decisions, missed opportunities, and tool usage.

### Requirements:
- Avoid generic phrases like "tech-savvy", "busy", "values quality", or "likes innovation."
- Include at least one specific complaint they have that others dismiss.
- Show behavioral depth—what do they actually *do*, not just what they *say* they value.
- Format as a **clean, structured Markdown document** with headings and short readable paragraphs.
- This persona should be **directly useful for product development, messaging, UX design, and GTM strategy.**`

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