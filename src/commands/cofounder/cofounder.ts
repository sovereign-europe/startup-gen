// This command now returns a signal that the cofounder questionnaire should be started
// All UI logic has been moved to App.tsx with useCofounderQuestionnaire hook
export async function cofounderCommand(): Promise<string> {
  return "COFOUNDER_QUESTIONNAIRE_START"
}
