// src/segmentAudio.ts

import { promises as fs } from 'fs'
import path from 'path'

import ffmpegPath from 'ffmpeg-static'
import ffmpeg from 'fluent-ffmpeg'

type SegmentAudioOptions = {
  inputFile: string
  segmentTimeSeconds: number
}

function timemarkToSeconds(timemark: string): number {
  const parts = timemark.split(':').map(Number)
  return parts[0] * 3600 + parts[1] * 60 + parts[2]
}

async function segmentAudio(options: SegmentAudioOptions): Promise<string[]> {
  const { inputFile, segmentTimeSeconds } = options

  // Check if input file exists
  try {
    await fs.access(inputFile)
  } catch (err) {
    throw new Error('Input file does not exist')
  }

  const outputFileNameTemplate = path.basename(inputFile, path.extname(inputFile)) + '%03d.m4a'
  const outputDirectory = path.dirname(inputFile)
  const outputPath = path.join(outputDirectory, outputFileNameTemplate)

  // Configure FfmpegCommand
  const command = ffmpeg()
    .setFfmpegPath(ffmpegPath)
    .input(inputFile)
    .output(outputPath)
    .outputOptions(['-f', 'segment', '-segment_time', `${segmentTimeSeconds}`, '-c', 'copy'])

  // Execute FfmpegCommand with async/await
  const segmentPaths: string[] = await new Promise((resolve, reject) => {
    let inputFileDuration = 0

    command
      .on('error', (err) => {
        reject(err)
      })
      .on('end', () => {
        const totalSegments = Math.ceil(inputFileDuration / segmentTimeSeconds)
        const segments: string[] = []
        for (let i = 0; i < totalSegments; i++) {
          const segmentPath = path.join(outputDirectory, outputFileNameTemplate.replace('%03d', String(i).padStart(3, '0')))
          segments.push(segmentPath)
        }
        resolve(segments)
      })
      .on('codecData', (data) => {
        inputFileDuration = timemarkToSeconds(data.duration)
      })
      .run()
  })
  return segmentPaths
}

async function deleteFiles(filePaths: string[]): Promise<void> {
  for (const filePath of filePaths) {
    try {
      await fs.access(filePath)
      await fs.unlink(filePath)
      strapi.log.info(`Deleted file: ${filePath}`)
    } catch (err) {
      if (err.code === 'ENOENT') {
        strapi.log.info(`File does not exist: ${filePath}`)
      } else {
        strapi.log.error(`Error deleting file: ${filePath}`, err)
      }
    }
  }
}

export { segmentAudio, deleteFiles }
