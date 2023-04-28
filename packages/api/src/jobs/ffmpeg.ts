import { access, unlink } from 'fs/promises'
import path from 'path'
import ffmpegPath from 'ffmpeg-static'
import ffmpeg from 'fluent-ffmpeg'

// Configure ffmpeg to use the provided static path
ffmpeg.setFfmpegPath(ffmpegPath)

export async function deleteFiles(filePaths: string[]): Promise<void> {
  for (const filePath of filePaths) {
    try {
      await access(filePath)
      await unlink(filePath)
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

/**
 * Converts an M4A file to MP3.
 * @param inputPath The input M4A file path.
 * @returns A promise that resolves with the output MP3 file path when the conversion is complete.
 */
export function convertM4AtoMP3(inputPath: string): Promise<string> {
  const inputDir = path.dirname(inputPath)
  const fileName = path.basename(inputPath, '.m4a')
  const outputPath = path.join(inputDir, `${fileName}.mp3`)

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .outputFormat('mp3')
      .output(outputPath)
      .on('end', () => {
        resolve(outputPath)
      })
      .on('error', (error) => {
        reject(error)
      })
      .run()
  })
}

type SegmentAudioOptions = {
  inputFile: string
  segmentTimeSeconds: number
}

function timemarkToSeconds(timemark: string): number {
  const parts = timemark.split(':').map(Number)
  return parts[0] * 3600 + parts[1] * 60 + parts[2]
}

export async function segmentAudio(options: SegmentAudioOptions): Promise<string[]> {
  const { inputFile, segmentTimeSeconds } = options

  // Check if input file exists
  try {
    await access(inputFile)
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
