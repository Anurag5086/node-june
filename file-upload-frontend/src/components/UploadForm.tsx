import { useCallback, useRef, useState, type DragEvent, type FormEvent } from 'react'
import { uploadFile } from '../api/upload'
import './UploadForm.css'

const TITLE_MAX = 200
const DESC_MAX = 500
const MAX_BYTES = 5 * 1024 * 1024

type FieldErrors = {
  title?: string
  description?: string
  file?: string
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function UploadForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [statusMessage, setStatusMessage] = useState('')
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const clearPreview = useCallback(() => {
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
  }, [preview])

  const setSelectedFile = useCallback(
    (next: File | null) => {
      clearPreview()
      setFile(next)
      setErrors((e) => ({ ...e, file: undefined }))
      if (next) setPreview(URL.createObjectURL(next))
    },
    [clearPreview],
  )

  const validate = (): FieldErrors => {
    const next: FieldErrors = {}
    const t = title.trim()
    const d = description.trim()

    if (t.length < 3) next.title = 'Title must be at least 3 characters.'
    else if (t.length > TITLE_MAX) next.title = `Title cannot exceed ${TITLE_MAX} characters.`

    if (d.length < 3) next.description = 'Description must be at least 3 characters.'
    else if (d.length > DESC_MAX)
      next.description = `Description cannot exceed ${DESC_MAX} characters.`

    if (!file) next.file = 'Please select an image to upload.'
    else if (!file.type.startsWith('image/'))
      next.file = 'Only image files are accepted.'
    else if (file.size > MAX_BYTES) next.file = 'Image must be 5 MB or smaller.'

    return next
  }

  const handleFile = (selected: File | undefined) => {
    if (!selected) return
    if (!selected.type.startsWith('image/')) {
      setErrors((e) => ({ ...e, file: 'Only image files are accepted.' }))
      return
    }
    if (selected.size > MAX_BYTES) {
      setErrors((e) => ({ ...e, file: 'Image must be 5 MB or smaller.' }))
      return
    }
    setSelectedFile(selected)
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    handleFile(e.dataTransfer.files[0])
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const fieldErrors = validate()
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0 || !file) return

    setStatus('loading')
    setStatusMessage('')
    setUploadedImageUrl(null)

    try {
      const result = await uploadFile({ title, description, file })
      setStatus('success')
      setStatusMessage(result.message)
      setUploadedImageUrl(result.imageUrl)
      setTitle('')
      setDescription('')
      setSelectedFile(null)
      if (inputRef.current) inputRef.current.value = ''
    } catch (err) {
      setStatus('error')
      setStatusMessage(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  const resetForm = () => {
    setTitle('')
    setDescription('')
    setSelectedFile(null)
    setErrors({})
    setStatus('idle')
    setStatusMessage('')
    setUploadedImageUrl(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const copyImageUrl = async () => {
    if (!uploadedImageUrl) return
    try {
      await navigator.clipboard.writeText(uploadedImageUrl)
    } catch {
      /* clipboard may be unavailable */
    }
  }

  return (
    <form className="upload-form" onSubmit={onSubmit} noValidate>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="title">
            <span className="label-text">Title</span>
            <span className="label-hint">Required · 3–200 characters</span>
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              setErrors((prev) => ({ ...prev, title: undefined }))
            }}
            placeholder="e.g. Summer collection lookbook"
            maxLength={TITLE_MAX}
            autoComplete="off"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'title-error' : undefined}
          />
          <div className="field-meta">
            {errors.title ? (
              <span id="title-error" className="field-error" role="alert">
                {errors.title}
              </span>
            ) : (
              <span />
            )}
            <span className="char-count">
              {title.length}/{TITLE_MAX}
            </span>
          </div>
        </div>

        <div className="field field--wide">
          <label htmlFor="description">
            <span className="label-text">Description</span>
            <span className="label-hint">Required · 3–500 characters</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              setErrors((prev) => ({ ...prev, description: undefined }))
            }}
            placeholder="Describe the image, context, or intended use…"
            rows={4}
            maxLength={DESC_MAX}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'description-error' : undefined}
          />
          <div className="field-meta">
            {errors.description ? (
              <span id="description-error" className="field-error" role="alert">
                {errors.description}
              </span>
            ) : (
              <span />
            )}
            <span className="char-count">
              {description.length}/{DESC_MAX}
            </span>
          </div>
        </div>

        <div className="field field--wide">
          <span className="label-text" id="file-label">
            Image
          </span>
          <span className="label-hint">PNG, JPG, WebP · max 5 MB</span>

          <div
            className={`dropzone ${dragActive ? 'dropzone--active' : ''} ${file ? 'dropzone--filled' : ''}`}
            onDragEnter={(e) => {
              e.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              setDragActive(false)
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                inputRef.current?.click()
              }
            }}
            role="button"
            tabIndex={0}
            aria-labelledby="file-label"
            aria-describedby={errors.file ? 'file-error' : undefined}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="dropzone-input"
              onChange={(e) => handleFile(e.target.files?.[0])}
              aria-hidden
            />

            {preview ? (
              <div className="dropzone-preview">
                <img src={preview} alt="" />
                <div className="preview-overlay">
                  <p className="preview-name">{file?.name}</p>
                  <p className="preview-size">{file && formatSize(file.size)}</p>
                  <button
                    type="button"
                    className="preview-change"
                    onClick={(e) => {
                      e.stopPropagation()
                      inputRef.current?.click()
                    }}
                  >
                    Change image
                  </button>
                </div>
              </div>
            ) : (
              <div className="dropzone-empty">
                <div className="dropzone-icon" aria-hidden>
                  <svg viewBox="0 0 48 48" fill="none">
                    <path
                      d="M24 32V16M24 16L18 22M24 16L30 22"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M8 36V12C8 10.8954 8.89543 10 10 10H38C39.1046 10 40 10.8954 40 12V36C40 37.1046 39.1046 38 38 38H10C8.89543 38 8 37.1046 8 36Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
                <p className="dropzone-title">Drop your image here</p>
                <p className="dropzone-sub">or click to browse from your device</p>
              </div>
            )}
          </div>

          {errors.file && (
            <span id="file-error" className="field-error field-error--block" role="alert">
              {errors.file}
            </span>
          )}
        </div>
      </div>

      {statusMessage && status === 'error' && (
        <div className="toast toast--error" role="alert">
          <svg className="toast-icon" viewBox="0 0 20 20" fill="none" aria-hidden>
            <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="10" cy="14" r="0.75" fill="currentColor" />
          </svg>
          <span>{statusMessage}</span>
        </div>
      )}

      {status === 'success' && uploadedImageUrl && (
        <div className="upload-result" role="status">
          <div className="upload-result-header">
            <svg className="toast-icon" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path
                d="M6 10L9 13L14 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{statusMessage}</span>
          </div>

          <div className="upload-result-preview">
            <img src={uploadedImageUrl} alt="Uploaded" />
          </div>

          <div className="upload-result-url">
            <span className="upload-result-label">Image URL</span>
            <div className="upload-result-url-row">
              <a
                href={uploadedImageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="upload-result-link"
              >
                {uploadedImageUrl}
              </a>
              <button type="button" className="btn-copy" onClick={copyImageUrl}>
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={resetForm} disabled={status === 'loading'}>
          Clear
        </button>
        <button type="submit" className="btn btn--primary" disabled={status === 'loading'}>
          {status === 'loading' ? (
            <>
              <span className="btn-spinner" aria-hidden />
              Uploading…
            </>
          ) : (
            'Upload to gallery'
          )}
        </button>
      </div>
    </form>
  )
}
