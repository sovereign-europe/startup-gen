import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import fs from "fs-extra"
import path from "path"
import { updateFile } from "./updateFile"

vi.mock("fs-extra")

const mockFs = vi.mocked(fs)

describe("updateFile tool", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFs.ensureDir.mockResolvedValue(undefined)
    mockFs.writeFile.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("should successfully update a file within the project directory", async () => {
    const filePath = "test-file.txt"
    const content = "Hello, World!"

    await updateFile(filePath, content)

    expect(mockFs.ensureDir).toHaveBeenCalledWith(path.dirname(path.resolve(filePath)))
    expect(mockFs.writeFile).toHaveBeenCalledWith(path.resolve(filePath), content, "utf-8")
  })

  it("should create parent directories if they don't exist", async () => {
    const filePath = "nested/folder/test-file.txt"
    const content = "Test content"

    await updateFile(filePath, content)

    expect(mockFs.ensureDir).toHaveBeenCalledWith(path.dirname(path.resolve(filePath)))
    expect(mockFs.writeFile).toHaveBeenCalledWith(path.resolve(filePath), content, "utf-8")
  })

  it("should throw error when file path is outside project directory", async () => {
    const filePath = "../outside-project/test-file.txt"
    const content = "Malicious content"

    await expect(updateFile(filePath, content)).rejects.toThrow("File path must be within the project directory")

    expect(mockFs.ensureDir).not.toHaveBeenCalled()
    expect(mockFs.writeFile).not.toHaveBeenCalled()
  })

  it("should throw error when file path is absolute and outside project", async () => {
    const filePath = "/tmp/malicious-file.txt"
    const content = "Malicious content"

    await expect(updateFile(filePath, content)).rejects.toThrow("File path must be within the project directory")

    expect(mockFs.ensureDir).not.toHaveBeenCalled()
    expect(mockFs.writeFile).not.toHaveBeenCalled()
  })

  it("should handle file writing errors", async () => {
    const filePath = "test-file.txt"
    const content = "Test content"
    const writeError = new Error("Permission denied")

    mockFs.writeFile.mockRejectedValue(writeError)

    await expect(updateFile(filePath, content)).rejects.toThrow("Permission denied")

    expect(mockFs.ensureDir).toHaveBeenCalled()
    expect(mockFs.writeFile).toHaveBeenCalledWith(path.resolve(filePath), content, "utf-8")
  })

  it("should handle directory creation errors", async () => {
    const filePath = "nested/test-file.txt"
    const content = "Test content"
    const dirError = new Error("Cannot create directory")

    mockFs.ensureDir.mockRejectedValue(dirError)

    await expect(updateFile(filePath, content)).rejects.toThrow("Cannot create directory")

    expect(mockFs.ensureDir).toHaveBeenCalled()
    expect(mockFs.writeFile).not.toHaveBeenCalled()
  })

  it("should work with different file extensions", async () => {
    const testCases = [
      { path: "README.md", content: "# Project Title" },
      { path: "package.json", content: '{"name": "test"}' },
      { path: "src/index.ts", content: "console.log('hello')" },
      { path: "docs/api.txt", content: "API documentation" },
    ]

    for (const testCase of testCases) {
      await updateFile(testCase.path, testCase.content)

      expect(mockFs.writeFile).toHaveBeenCalledWith(path.resolve(testCase.path), testCase.content, "utf-8")
    }

    expect(mockFs.writeFile).toHaveBeenCalledTimes(testCases.length)
  })

  it("should handle empty content", async () => {
    const filePath = "empty-file.txt"
    const content = ""

    await updateFile(filePath, content)

    expect(mockFs.writeFile).toHaveBeenCalledWith(path.resolve(filePath), content, "utf-8")
  })

  it("should handle special characters in content", async () => {
    const filePath = "special-chars.txt"
    const content = "Special chars: 🚀 äöü ñ 中文 \n\t\r"

    await updateFile(filePath, content)

    expect(mockFs.writeFile).toHaveBeenCalledWith(path.resolve(filePath), content, "utf-8")
  })
})
