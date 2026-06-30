import { useRef } from 'react'

export default function OtpInput({
  value,
  onChange,
  length = 6,
  error,
}) {
  const inputsRef = useRef([])

  const digits = value.padEnd(length, ' ').split('').slice(0, length)

  const updateValue = (index, digit) => {
    const chars = value.padEnd(length, ' ').split('').slice(0, length)
    chars[index] = digit
    onChange(chars.join('').replace(/ /g, '').slice(0, length))
  }

  const handleChange = (index, char) => {
    const digit = char.replace(/\D/g, '').slice(-1)
    if (!digit) return
    updateValue(index, digit)
    if (index < length - 1) inputsRef.current[index + 1]?.focus()
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      if (digits[index]?.trim()) {
        updateValue(index, '')
      } else if (index > 0) {
        updateValue(index - 1, '')
        inputsRef.current[index - 1]?.focus()
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(pasted)
    const focusIndex = Math.min(pasted.length, length - 1)
    inputsRef.current[focusIndex]?.focus()
  }

  return (
    <div>
      <div className="flex justify-center gap-2 sm:gap-3">
        {Array.from({ length }).map((_, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digits[i]?.trim() || ''}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={`h-12 w-10 rounded-lg border bg-white text-center text-lg font-semibold text-gray-900 shadow-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 sm:h-14 sm:w-12 ${
              error ? 'border-red-400' : 'border-gray-300'
            }`}
            aria-label={`Digit ${i + 1}`}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-center text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
