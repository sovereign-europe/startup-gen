import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import fs from "fs-extra"
import { execSync } from "child_process"
import inquirer from "inquirer"
import { initCommand } from "./init"
import { createConfig } from "../utils/config"

vi.mock("fs-extra")
vi.mock("child_process")
vi.mock("inquirer")
vi.mock("../utils/config")

const mockFs = vi.mocked(fs)
const mockExecSync = vi.mocked(execSync)
const mockCreateConfig = vi.mocked(createConfig)

describe("init command", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFs.writeFile.mockResolvedValue(undefined)
    mockCreateConfig.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should create required files when initialized", async () => {
    vi.mocked(inquirer.prompt)
      .mockResolvedValueOnce({
        startupName: "Test Startup",
        openaiApiKey: "test-api-key",
        autoCommit: false,
      })
      .mockResolvedValueOnce({
        proceed: false,
      })

    await initCommand()

    expect(mockFs.writeFile).toHaveBeenCalledWith("README.md", expect.stringContaining("# Test Startup"))
    expect(mockFs.writeFile).toHaveBeenCalledWith(".env", "OPENAI_API_KEY=test-api-key\n")
    expect(mockFs.writeFile).toHaveBeenCalledWith(".gitignore", expect.stringContaining("node_modules/"))
    expect(mockCreateConfig).toHaveBeenCalledWith({ autoCommit: false })
  })

  it("should initialize git repository and commit when auto-commit is enabled", async () => {
    vi.mocked(inquirer.prompt)
      .mockResolvedValueOnce({
        startupName: "Test Startup",
        openaiApiKey: "test-api-key",
        autoCommit: true,
      })
      .mockResolvedValueOnce({
        proceed: false,
      })

    await initCommand()

    expect(mockExecSync).toHaveBeenCalledWith("git init", { stdio: "ignore" })
    expect(mockExecSync).toHaveBeenCalledWith("git add README.md .gitignore startup.config.json", {
      stdio: "ignore",
    })
    expect(mockExecSync).toHaveBeenCalledWith('git commit -m "Initial commit: Setup Test Startup with Startup CLI"', {
      stdio: "ignore",
    })
  })

  it("should initialize git repository but not commit when auto-commit is disabled", async () => {
    vi.mocked(inquirer.prompt)
      .mockResolvedValueOnce({
        startupName: "Test Startup",
        openaiApiKey: "test-api-key",
        autoCommit: false,
      })
      .mockResolvedValueOnce({
        proceed: false,
      })

    await initCommand()

    expect(mockExecSync).toHaveBeenCalledWith("git init", { stdio: "ignore" })
    expect(mockExecSync).not.toHaveBeenCalledWith("git add README.md .gitignore startup.config.json", {
      stdio: "ignore",
    })
    expect(mockExecSync).not.toHaveBeenCalledWith(
      'git commit -m "Initial commit: Setup Test Startup with Startup CLI"',
      {
        stdio: "ignore",
      },
    )
  })
})
