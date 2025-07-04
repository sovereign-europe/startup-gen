import * as fs from "fs"
import * as path from "path"

export function completedCustomerInterviews(): number {
  try {
    const interviewsPath = path.join(process.cwd(), "customer-discovery", "interviews")
    if (!fs.existsSync(interviewsPath)) {
      return 0
    }
    const files = fs.readdirSync(interviewsPath)
    return files.filter((file) => file.endsWith(".md") || file.endsWith(".txt")).length
  } catch {
    return 0
  }
}
