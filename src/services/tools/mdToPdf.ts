import { mdToPdf } from "md-to-pdf"
import fs from "fs-extra"

export async function convertMdToPdf(pathToMd: string, outputPath: string) {
  const pdf = await mdToPdf({ path: pathToMd })
  if (pdf) {
    fs.writeFileSync(outputPath, pdf.content)
  }
}
