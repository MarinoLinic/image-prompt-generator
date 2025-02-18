import React from 'react'

const CopyButton = ({ text }) => {
	const copyToClipboard = () => {
		navigator.clipboard.writeText(text)
		alert('Copied to clipboard!')
	}

	return (
		<button onClick={copyToClipboard} className="copy-btn">
			Copy
		</button>
	)
}

export default CopyButton
