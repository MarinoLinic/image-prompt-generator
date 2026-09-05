import React, { useState, useEffect, useMemo } from 'react'
import Category from './Category'
import CopyButton from './CopyButton'

const PromptGenerator = () => {
	const [objectName, setObjectName] = useState('')
	const [selectedOptions, setSelectedOptions] = useState({})
	const [categories, setCategories] = useState({})
	const [search, setSearch] = useState('')

	// Load words.json
	useEffect(() => {
		fetch('/words.json')
			.then((res) => res.json())
			.then((data) => setCategories(data))
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

	const clearAll = () => setSelectedOptions({})

	const joinList = (items) => {
		if (items.length === 0) return ''
		if (items.length === 1) return items[0]
		if (items.length === 2) return `${items[0]} and ${items[1]}`
		return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
	}

	const articleFor = (word) => (/^[aeiou]/i.test(word.trim()) ? 'An' : 'A')

	// Per-category natural language templates, applied in a fixed order
	const phraseMakers = [
		['Era & Setting', (o) => `in a ${joinList(o.map((s) => s.toLowerCase()))} setting`],
		['Art Style', (o) => `rendered in ${joinList(o.map((s) => (s.endsWith('ing') ? s : `${s} style`)))}`],
		['Perspective & Angle', (o) => {
			const fmt = (s) => {
				const low = s.toLowerCase()
				if (low.includes('view')) return `from a ${low}`
				if (s === 'Symmetrical') return 'with a symmetrical composition'
				return `in a ${low} perspective`
			}
			return `viewed ${joinList(o.map(fmt))}`
		}],
		['Lighting', (o) => `lit by ${joinList(o.map((s) => s.toLowerCase()))}`],
		['Mood & Atmosphere', (o) => `with a ${joinList(o.map((s) => s.toLowerCase()))} atmosphere`],
		['Color Palette', (o) => {
			const fmt = (s) => (s === 'High Saturation' ? 'highly saturated' : `${s.toLowerCase()}`)
			return `in ${joinList(o.map(fmt))} colors`
		}],
		['Texture & Detail Effects', (o) => `accented with ${joinList(o.map((s) => s.toLowerCase()))}`],
	]

	// Generate prompt text
	const generatePrompt = () => {
		const subject = objectName.trim() || 'subject'
		const phrases = phraseMakers
			.map(([category, make]) => (selectedOptions[category]?.length ? make(selectedOptions[category]) : null))
			.filter(Boolean)
		const matOpts = selectedOptions['Surface & Material'] || []
		const leadAdj = matOpts.length > 0 ? `${joinList(matOpts.map((s) => s.toLowerCase()))} ` : ''
		return `${articleFor(subject)} ${leadAdj}${subject}` + (phrases.length > 0 ? `, ${phrases.join(', ')}` : '')
	}

	const selectedCount = useMemo(
		() => Object.values(selectedOptions).reduce((acc, arr) => acc + arr.length, 0),
		[selectedOptions]
	)

	// Filter categories by search
	const filteredCategories = useMemo(() => {
		if (!search.trim()) return categories
		const q = search.toLowerCase()
		const out = {}
		Object.entries(categories).forEach(([cat, options]) => {
			const matches = Object.keys(options).filter((o) => o.toLowerCase().includes(q))
			if (matches.length > 0) out[cat] = Object.fromEntries(matches.map((m) => [m, options[m]]))
		})
		return out
	}, [categories, search])

	return (
		<div className="container">
			<header className="header">
				<h1>AI Image Prompt Builder</h1>
				<p className="subtitle">Pick aesthetic attributes to compose a prompt, then copy it.</p>
			</header>

			<div className="controls">
				<input
					type="text"
					placeholder="Enter object name... (e.g. dragon, violin, spaceship)"
					value={objectName}
					onChange={(e) => setObjectName(e.target.value)}
					className="input-box"
				/>
				<input
					type="text"
					placeholder="Filter attributes..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="input-box search-box"
				/>
			</div>

			<div className="categories">
				{Object.entries(filteredCategories).map(([category, options]) => (
					<Category
						key={category}
						title={category}
						options={Object.entries(options)}
						selectedOptions={selectedOptions[category] || []}
						onToggle={(option) => handleToggle(category, option)}
						forceOpen={search.trim().length > 0}
					/>
				))}
				{Object.keys(filteredCategories).length === 0 && (
					<p className="no-results">No attributes match "{search}".</p>
				)}
			</div>

			<div className="output-panel">
				<div className="output-header">
					<span className="output-label">Your prompt</span>
					{selectedCount > 0 && (
						<button className="clear-btn" onClick={clearAll}>
							Clear ({selectedCount})
						</button>
					)}
				</div>
				<textarea className="output-box" readOnly value={generatePrompt()} rows={3} />
				<CopyButton text={generatePrompt()} />
			</div>
		</div>
	)
}

export default PromptGenerator
