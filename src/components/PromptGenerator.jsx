import { useState, useEffect, useMemo } from 'react'
import Category from './Category'
import CopyButton from './CopyButton'
import ImagePreview from './ImagePreview'
import { migrateSelections, normalizeSelections } from '../lib/catalog'

function readStorage(key, fallback, parse = false) {
	try {
		const value = localStorage.getItem(key)
		return value === null ? fallback : parse ? JSON.parse(value) : value
	} catch { return fallback }
}

const PromptGenerator = () => {
	const [objectName, setObjectName] = useState(() => readStorage('objectName', ''))
	const [selectedOptions, setSelectedOptions] = useState(() => migrateSelections(readStorage('selectedOptions', {}, true)))
	const [categories, setCategories] = useState(null)
	const [search, setSearch] = useState('')
	const [imageView, setImageView] = useState(() => readStorage('attributeDisplay', 'text') === 'images')
	const [preview, setPreview] = useState(null)
	const [loadError, setLoadError] = useState(false)

	// Load words.json
	useEffect(() => {
		const abort = new AbortController()
		fetch('/words.json', { signal: abort.signal })
			.then((res) => { if (!res.ok) throw new Error('Catalog unavailable'); return res.json() })
			.then((data) => { setSelectedOptions(previous => normalizeSelections(previous, data)); setCategories(data) })
			.catch((error) => { if (error.name !== 'AbortError') setLoadError(true) })
		return () => abort.abort()
	}, [])

	// Save to local storage
	useEffect(() => {
		if (!categories) return
		try {
			localStorage.setItem('objectName', objectName)
			localStorage.setItem('selectedOptions', JSON.stringify(selectedOptions))
			localStorage.setItem('attributeDisplay', imageView ? 'images' : 'text')
		} catch { /* Keep the current session usable when browser storage is unavailable. */ }
	}, [objectName, selectedOptions, imageView, categories])

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
				return `in a ${low} perspective`
			}
			return `viewed ${joinList(o.map(fmt))}`
		}],
		['Composition', (o) => {
			const phrases = {
				'Symmetrical': 'with a symmetrical composition',
				'Silhouette': 'presented as a silhouette',
				'Leading Lines': 'framed with strong leading lines',
				'Negative Space': 'with generous negative space around it',
				'Panoramic': 'in a sweeping panoramic frame',
				'Minimalist Composition': 'in a minimalist composition',
				'Maximalist Composition': 'in a dense, maximalist composition',
			}
			return joinList(o.map((s) => phrases[s] || `with ${s.toLowerCase()}`))
		}],
		['Lighting', (o) => `lit by ${joinList(o.map((s) => s.toLowerCase()))}`],
		['Mood & Atmosphere', (o) => `with a ${joinList(o.map((s) => s.toLowerCase()))} atmosphere`],
		['Color Palette', (o) => {
			const fmt = (s) => (s === 'High Saturation' ? 'highly saturated' : `${s.toLowerCase()}`)
			return `in ${joinList(o.map(fmt))} colors`
		}],
		['Texture & Detail Effects', (o) => `accented with ${joinList(o.map((s) => s.toLowerCase()))}`],
		['Background & Environment', (o) => {
			const blanks = ['White', 'Black', 'Gradient', 'Transparent']
			const blank = o.filter((s) => blanks.includes(s)).map((s) => s.toLowerCase() + ' background')
			const scenes = o.filter((s) => !blanks.includes(s)).map((s) => `${s.toLowerCase()} backdrop`)
			return `on a ${joinList([...blank, ...scenes])}`
		}],
	]

	// Generate prompt text
	const generatePrompt = () => {
		const subject = objectName.trim() || 'subject'
		const phrases = phraseMakers
			.map(([category, make]) => (selectedOptions[category]?.length ? make(selectedOptions[category]) : null))
			.filter(Boolean)
		const matOpts = selectedOptions['Surface & Material'] || []
		const leadAdj = matOpts.length > 0 ? `${joinList(matOpts.map((s) => s.toLowerCase()))} ` : ''
		return `${articleFor(leadAdj + subject)} ${leadAdj}${subject}` + (phrases.length > 0 ? `, ${phrases.join(', ')}` : '')
	}

	const selectedCount = useMemo(
		() => Object.values(selectedOptions).reduce((acc, arr) => acc + arr.length, 0),
		[selectedOptions]
	)

	// Filter categories by search
	const filteredCategories = useMemo(() => {
		if (!search.trim()) return categories || {}
		const q = search.toLowerCase()
		const out = {}
		Object.entries(categories || {}).forEach(([cat, options]) => {
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

			<div className="attribute-view-toolbar">
				<span>Attribute view</span>
				<div role="group" aria-label="Attribute view">
					<button className={!imageView ? 'active' : ''} aria-pressed={!imageView} onClick={() => setImageView(false)}>Text</button>
					<button className={imageView ? 'active' : ''} aria-pressed={imageView} onClick={() => setImageView(true)}>Images</button>
				</div>
			</div>
			{loadError && <p role="alert" className="catalog-error">Couldn’t load the attributes. <button onClick={() => window.location.reload()}>Try again</button></p>}
			{!categories && !loadError && <p role="status">Loading attributes…</p>}
			<div className={`categories ${imageView ? 'categories-with-images' : ''}`}>
				{Object.entries(filteredCategories).map(([category, options]) => (
					<Category
						key={category}
						title={category}
						options={Object.entries(options)}
						selectedOptions={selectedOptions[category] || []}
						onToggle={(option) => handleToggle(category, option)}
						forceOpen={search.trim().length > 0}
						imageView={imageView}
						onPreview={setPreview}
					/>
				))}
				{categories && Object.keys(filteredCategories).length === 0 && (
					<p className="no-results">No attributes match &quot;{search}&quot;.</p>
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
			{preview && <ImagePreview item={preview} onClose={() => setPreview(null)} selected={!!selectedOptions[preview.category]?.includes(preview.name)} onToggle={() => handleToggle(preview.category, preview.name)} />}
		</div>
	)
}

export default PromptGenerator
