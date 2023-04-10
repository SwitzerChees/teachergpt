import { existsSync } from 'fs'
import pdfUtil from 'pdf-to-text'
import { PDFPage } from '@teachergpt/common'

export const getTextFromPDF = async (path: string): Promise<PDFPage[]> => {
  const pdfPages: PDFPage[] = []
  try {
    if (!existsSync(path)) return []
    const pdfInfo = await getPDFInfo(path)
    for (let i = 1; i <= pdfInfo.pages; i++) {
      const textFromPage = await extractTextFromPDF(path, { from: i, to: i })
      pdfPages.push({ pageNumber: i, text: textFromPage })
    }
  } catch (error) {
    strapi.log.error(error)
  }
  return pdfPages
}

const getPDFInfo = (path: string): Promise<{ pages: number }> => {
  return new Promise((resolve, reject) => {
    pdfUtil.info(path, function (err, info) {
      if (err) {
        reject(err)
        return
      }
      resolve(info)
    })
  })
}

const extractTextFromPDF = (path: string, options: { from: number; to: number }): Promise<string> => {
  return new Promise((resolve, reject) => {
    pdfUtil.pdfToText(path, options, function (err, data) {
      if (err) {
        reject(err)
        return
      }
      resolve(data.trim().replace(/\s{2,}/g, ' '))
    })
  })
}
