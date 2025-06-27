export const customerPersonaPrompt = `Create a detailed and highly realistic customer persona for a lean startup, based on the following context:

**High-level customer definition:** {{highLevelDefinition}}
{{#additionalRefinement}}{{additionalRefinement}}{{/additionalRefinement}}

Your output must describe one believable individual—not a generalized user type. Write with vivid specificity.

### The persona must include the following sections:

1. **Name**: A realistic full name.
2. **Demographics**: Age, location, job title, seniority, and income range.
3. **Pain Points**: Make them emotionally resonant and behaviorally observable. What keeps them stuck?

### Requirements:
- Avoid generic phrases like "tech-savvy", "busy", "values quality", or "likes innovation."
- Include at least one specific complaint they have that others dismiss.
- Show behavioral depth—what do they actually *do*, not just what they *say* they value.
- Format as a **clean, structured Markdown document** with headings and short readable paragraphs.
- This persona should be **directly useful for product development, messaging, UX design, and GTM strategy.**`
