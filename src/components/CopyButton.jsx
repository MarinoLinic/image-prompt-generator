import React, { useState } from 'react'

const CopyButton = ({ text }) => {
	const [copied, setCopied] = useState(false)

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(text)
		} catch {
			const ta = document.createElement('textarea')
			ta.value = text
			document.body.appendChild(ta)
			ta.select()
			document.execCommand('copy')
			document.body.removeChild(ta)
		}
		setCopied(true)
		setTimeout(() => setCopied(false), 1500)
	}

	return (
		<button onClick={copyToClipboard} className={`copy-btn ${copied ? 'copied' : ''}`}>
			{copied ? 'Copied!' : 'Copy prompt'}
		</button>
	)
}

export default CopyButton
