import { StrapiObject } from '.'

export interface AssetFormat {
  ext: string
  url: string
  hash: string
  mime: string
  name: string
  size: number
  width: number
  height: number
}

interface StrapiAsset extends StrapiObject {
  id: number
  name: string
  alternativeText?: string
  caption?: string
  width: number
  formats?: {
    large?: AssetFormat
    medium?: AssetFormat
    small?: AssetFormat
    thumbnail?: AssetFormat
  }
  height: number
  hash: string
  ext: string
  mime: string
  size: number
  url: string
  previewUrl?: string
  provider: string
  createdAt: Date
  updatedAt: Date
}

export { StrapiAsset }
