export const problemInterviewPrompt = `Generate a comprehensive problem interview script designed to validate the pain points of the customer persona. Based on the following context:

**Customer Persona:** {{personaContent}}

**High-level customer definition:** {{highLevelDefinition}}
{{additionalRefinement}}

Create a structured interview guide that follows lean startup methodology for problem validation. The interview should help validate the pain points, frustrations, and problems identified in the persona.

### The interview script must include the following sections:

1. **Interview Objectives**: Clear goals for what you want to validate or learn
2. **Pre-Interview Preparation**: How to find and screen interview candidates
3. **Opening Questions** (5 minutes): Build rapport and understand their context
   - Warm-up questions to get them talking
   - Questions about their role/situation
4. **Problem Discovery** (15 minutes): Explore their current challenges
   - Open-ended questions about their workflow/day
   - Questions that reveal pain points without leading
   - Follow-up probes to understand severity and frequency
5. **Pain Point Validation** (10 minutes): Validate specific problems from the persona
   - Questions that test the persona's identified pain points
   - Questions about current solutions they use
   - Questions about workarounds and their limitations
6. **Prioritization Questions** (5 minutes): Understand which problems matter most
   - Questions about impact and urgency
   - Trade-off questions
7. **Closing Questions** (5 minutes): Wrap up and gather additional insights
   - Questions about willingness to pay for solutions
   - Questions about referrals to other potential interviewees
8. **Post-Interview Analysis**: Framework for analyzing responses
   - Key metrics to track
   - Red flags to watch for
   - How to synthesize findings

### Requirements:
- Questions should be open-ended and non-leading
- Include specific example questions, not just categories
- Focus on understanding current behavior, not hypothetical scenarios  
- Include follow-up probes for each main question
- Provide guidance on what answers validate vs. invalidate assumptions
- Format as a **clean, structured Markdown document**
- Include timing estimates for each section
- Make it actionable for someone conducting their first customer interviews`
