import fs from "fs-extra"
import { mdToPdf } from "md-to-pdf"

export async function convertMdToPdf(pathToMd: string, outputPath: string) {
  const pdf = await mdToPdf({ path: pathToMd })
  if (pdf) {
    fs.writeFileSync(outputPath, pdf.content)
  }
}
