import { useEffect, useRef, useState } from 'react'

const CopyButton = ({ text, disabled }) => {
	const [copied, setCopied] = useState(false)
	const [error, setError] = useState(false)
	const timer = useRef(null)
	useEffect(() => () => clearTimeout(timer.current), [])

	const copyToClipboard = async () => {
		setError(false)
		try {
			await navigator.clipboard.writeText(text)
		} catch {
			const ta = document.createElement('textarea')
			ta.value = text
			document.body.appendChild(ta)
			ta.select()
			let success = false
			try { success = document.execCommand('copy') } catch { /* Show manual-copy guidance. */ }
			document.body.removeChild(ta)
			if (!success) { setError(true); return }
		}
		setCopied(true)
		clearTimeout(timer.current)
		timer.current = setTimeout(() => setCopied(false), 1500)
	}

	return (
		<><button disabled={disabled} onClick={copyToClipboard} className={`copy-btn ${copied ? 'copied' : ''}`} aria-live="polite">{copied ? 'Copied!' : 'Copy prompt'}</button>{error && <p role="alert">Select the prompt text and copy it manually.</p>}</>
	)
}

export default CopyButton
