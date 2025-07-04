import React from "react"
import { render } from "ink"
import { InteractiveApp } from "./components/InteractiveApp"

export async function startInteractiveMode() {
  render(<InteractiveApp />)
}
