import * as fs from "fs"
import * as path from "path"

import chokidar from "chokidar"

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

export function watchCustomerInterviews(callback: (count: number) => void): () => void {
  const interviewsPath = path.join(process.cwd(), "customer-discovery", "interviews")

  // Ensure directory exists before watching
  if (!fs.existsSync(interviewsPath)) {
    fs.mkdirSync(interviewsPath, { recursive: true })
  }

  const watcher = chokidar.watch(interviewsPath, {
    ignored: /^\./, // ignore dotfiles
    persistent: true,
    ignoreInitial: false,
  })

  const updateCount = () => {
    const count = completedCustomerInterviews()
    callback(count)
  }

  watcher.on("add", updateCount)
  watcher.on("unlink", updateCount)
  watcher.on("ready", updateCount)

  // Return cleanup function
  return () => {
    watcher.close()
  }
}
