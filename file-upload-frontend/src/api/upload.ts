const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export type UploadPayload = {
  title: string
  description: string
  file: File
}

export type UploadSuccess = {
  success: true
  message: string
  imageUrl: string
  file: {
    _id: string
    title: string
    description: string
    attachment: string
    createdAt: string
    updatedAt: string
  }
}

export type UploadError = {
  success: false
  message: string
  error?: unknown
}

export async function uploadFile(
  payload: UploadPayload,
): Promise<UploadSuccess> {
  const formData = new FormData()
  formData.append('title', payload.title.trim())
  formData.append('description', payload.description.trim())
  formData.append('file', payload.file)

  const response = await fetch(`${API_BASE}/api/file/single-upload`, {
    method: 'POST',
    body: formData,
  })

  const data = (await response.json()) as UploadSuccess | UploadError

  if (!response.ok || !data.success) {
    const message =
      'message' in data && data.message
        ? data.message
        : 'Upload failed. Please try again.'
    throw new Error(message)
  }

  return data
}
