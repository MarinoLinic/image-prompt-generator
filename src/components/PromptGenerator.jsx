import React, { useState, useEffect } from 'react'
import Category from './Category'
import CopyButton from './CopyButton'

const categories = {
	Appearance: ['Matte', 'Metallic', 'Bark-like'],
	Perspective: ['Isometric', 'Dimetric', "Bird's Eye"],
}

const PromptGenerator = () => {
	const [objectName, setObjectName] = useState('')
	const [selectedOptions, setSelectedOptions] = useState({})
	const [descriptions, setDescriptions] = useState({})

	// Load words.json
	useEffect(() => {
		fetch('/words.json')
			.then((res) => res.json())
			.then((data) => setDescriptions(data))
			.catch((err) => console.error('Failed to load words.json:', err))
	}, [])

	// Load from local storage
	useEffect(() => {
		const savedObject = localStorage.getItem('objectName')
		const savedOptions = localStorage.getItem('selectedOptions')

		if (savedObject) setObjectName(savedObject)
		if (savedOptions) setSelectedOptions(JSON.parse(savedOptions))
	}, [])

	// Save to local storage
	useEffect(() => {
		localStorage.setItem('objectName', objectName)
		localStorage.setItem('selectedOptions', JSON.stringify(selectedOptions))
	}, [objectName, selectedOptions])

	const handleToggle = (category, option) => {
		setSelectedOptions((prev) => {
			const updatedCategory = prev[category] ? [...prev[category]] : []
			if (updatedCategory.includes(option)) {
				return { ...prev, [category]: updatedCategory.filter((o) => o !== option) }
			} else {
				return { ...prev, [category]: [...updatedCategory, option] }
			}
		})
	}

	// Generate prompt text
	const generatePrompt = () => {
		let prompt = `A ${objectName}`
		Object.entries(selectedOptions).forEach(([category, options]) => {
			if (options.length > 0) {
				prompt += ` with ${options.join(', ')}`
			}
		})
		return prompt
	}

	return (
		<div className="container">
			<h1>AI Prompt Generator</h1>
			<input
				type="text"
				placeholder="Enter object name..."
				value={objectName}
				onChange={(e) => setObjectName(e.target.value)}
				className="input-box"
			/>
			{Object.entries(categories).map(([category, options]) => (
				<Category
					key={category}
					title={category}
					options={options}
					selectedOptions={selectedOptions[category] || []}
					onToggle={(option) => handleToggle(category, option)}
					descriptions={descriptions}
				/>
			))}
			<textarea className="output-box" readOnly value={generatePrompt()} />
			<CopyButton text={generatePrompt()} />
		</div>
	)
}

export default PromptGenerator
