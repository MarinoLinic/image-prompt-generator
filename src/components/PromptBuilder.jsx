import { useEffect, useMemo, useState } from 'react'
import AttributeCard from './AttributeCard'
import CopyButton from './CopyButton'
import Icon from './Icon'
import ImageViewer from './ImageViewer'
import { BASELINE, CATEGORY_META, filterCatalog, generatePrompt, normalizeSelections } from '../lib/catalog'

function readSaved(key, fallback) {
  try { const value = localStorage.getItem(key); return value === null ? fallback : JSON.parse(value) } catch { return fallback }
}
function readSubject() { try { return localStorage.getItem('objectName') || '' } catch { return '' } }

export default function PromptBuilder() {
  const [subject, setSubject] = useState(readSubject)
  const [saved, setSaved] = useState(() => readSaved('selectedOptions', {}))
  const [categories, setCategories] = useState(null)
  const [loadError, setLoadError] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState('Art Style')
  const [selectedOnly, setSelectedOnly] = useState(false)
  const [view, setView] = useState(() => readSaved('attributeView', 'grid') === 'list' ? 'list' : 'grid')
  const [preview, setPreview] = useState(null)
  const [promptOpen, setPromptOpen] = useState(false)
  const [storageError, setStorageError] = useState(false)
  useEffect(() => {
    const abort = new AbortController()
    fetch('/words.json', { signal: abort.signal }).then(response => { if (!response.ok) throw new Error('Catalog unavailable'); return response.json() }).then(setCategories).catch(error => { if (error.name !== 'AbortError') setLoadError(true) })
    return () => abort.abort()
  }, [])
  const selected = useMemo(() => normalizeSelections(saved, categories || {}), [saved, categories])
  const selectedCount = Object.values(selected).reduce((sum, values) => sum + values.length, 0)
  const total = Object.values(categories || {}).reduce((sum, values) => sum + Object.keys(values).length, 0)
  const items = useMemo(() => filterCatalog(categories || {}, query, active, selected, selectedOnly), [categories, query, active, selected, selectedOnly])
  const groups = [...new Set(items.map(item => item.category))]
  const prompt = generatePrompt(subject, selected)
  const searching = !!query.trim()
  useEffect(() => {
    if (!categories) return
    try {
      localStorage.setItem('objectName', subject)
      localStorage.setItem('selectedOptions', JSON.stringify(selected))
      localStorage.setItem('attributeView', JSON.stringify(view))
      setStorageError(false)
    } catch { setStorageError(true) }
  }, [subject, selected, view, categories])
  const toggle = (category, name) => setSaved(previous => {
    const next = normalizeSelections(previous, categories || {})
    const values = next[category] || []
    return { ...next, [category]: values.includes(name) ? values.filter(value => value !== name) : [...values, name] }
  })
  const navigate = category => { setActive(category); setQuery(''); setSelectedOnly(false); window.scrollTo({ top: 0, behavior: 'instant' }) }
  const title = selectedOnly ? 'Your selections' : searching ? 'Search results' : active === 'all' ? 'All attributes' : CATEGORY_META[active]?.label
  const previewIndex = preview ? items.findIndex(item => item.category === preview.category && item.name === preview.name) : -1
  const movePreview = offset => setPreview(items[(previewIndex + offset + items.length) % items.length])
  return <>
    <a className="skip-link" href="#attributes">Skip to attributes</a>
    <header className="app-header"><a className="brand" href="/" aria-label="Image Prompt Builder home"><span className="brand-mark"><Icon name="sparkles" size={23} /></span><span>Image Prompt Builder</span></a><button className="reference-button" aria-label="View default reference" onClick={() => setPreview({ name: 'Default reference', image: BASELINE })}><img src={BASELINE} alt="" width="32" height="32" /><span>Default reference</span><Icon name="expand" size={15} /></button></header>
    <div className="workspace">
      <aside className="category-sidebar" aria-label="Attribute categories">
        <p className="sidebar-label">Attributes <span>{total || '…'}</span></p>
        <nav className="category-nav"><button className={`category-link ${active === 'all' && !searching && !selectedOnly ? 'active' : ''}`} onClick={() => navigate('all')}><Icon name="grid" /><span>All attributes</span><span className="category-count">{total}</span></button><div className="nav-divider" />{Object.entries(CATEGORY_META).map(([category, meta]) => <button key={category} className={`category-link ${active === category && !searching && !selectedOnly ? 'active' : ''}`} onClick={() => navigate(category)}><Icon name={meta.icon} /><span>{meta.label}</span><span className={`category-count ${selected[category]?.length ? 'has-selection' : ''}`}>{selected[category]?.length ? `${selected[category].length} / ` : ''}{Object.keys(categories?.[category] || {}).length}</span></button>)}</nav>
        <button className={`selected-nav ${selectedOnly ? 'active' : ''}`} onClick={() => { setSelectedOnly(!selectedOnly); setQuery('') }}><Icon name="check" /><span>Your selections</span><span>{selectedCount}</span></button>
      </aside>
      <main className="catalog-main" id="attributes">
        <div className="subject-field"><label htmlFor="subject">What are you creating?</label><input id="subject" value={subject} onChange={event => setSubject(event.target.value)} placeholder="A fox, a floating city, an astronaut…" autoComplete="off" /></div>
        <div className="catalog-toolbar"><div className="search-field"><Icon name="search" size={19} /><input aria-label="Search all attributes" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search all attributes…" />{query && <button className="icon-button" onClick={() => setQuery('')} aria-label="Clear search"><Icon name="close" size={16} /></button>}<kbd>/</kbd></div><div className="view-switch" aria-label="Attribute view"><button className={view === 'grid' ? 'active' : ''} aria-label="Grid view" aria-pressed={view === 'grid'} onClick={() => setView('grid')}><Icon name="grid" size={18} /></button><button className={view === 'list' ? 'active' : ''} aria-label="List view" aria-pressed={view === 'list'} onClick={() => setView('list')}><Icon name="list" size={19} /></button></div></div>
        <div className="mobile-category-picker"><label className="sr-only" htmlFor="category-picker">Category</label><select id="category-picker" value={active} onChange={event => navigate(event.target.value)}><option value="all">All attributes</option>{Object.entries(CATEGORY_META).map(([category, meta]) => <option key={category} value={category}>{meta.label} ({Object.keys(categories?.[category] || {}).length})</option>)}</select><button className={selectedOnly ? 'active' : ''} aria-pressed={selectedOnly} onClick={() => { setSelectedOnly(!selectedOnly); setQuery('') }}>Selected ({selectedCount})</button></div>
        <div className="catalog-heading"><h1>{title}</h1><span role="status">{categories ? `${items.length} ${items.length === 1 ? 'attribute' : 'attributes'}` : 'Loading…'}</span></div>
        {loadError && <div className="empty-state" role="alert"><h2>Couldn’t load the attributes</h2><button className="secondary-button" onClick={() => window.location.reload()}>Try again</button></div>}
        {!loadError && !categories && <div className="loading-grid" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <div key={index} />)}</div>}
        {categories && !items.length && <div className="empty-state"><Icon name={selectedOnly ? 'check' : 'search'} size={30} /><h2>{selectedOnly ? 'No selections yet' : 'No matching attributes'}</h2><p>{selectedOnly ? 'Choose attributes to add them to your prompt.' : 'Try a different name, material, or effect.'}</p><button className="secondary-button" onClick={() => navigate('all')}>Browse all attributes</button></div>}
        {groups.map(category => <section className="attribute-group" key={category} aria-label={CATEGORY_META[category]?.label}>{groups.length > 1 && <h2 className="group-title"><Icon name={CATEGORY_META[category]?.icon} size={18} />{CATEGORY_META[category]?.label}</h2>}<div className={`attribute-grid ${view === 'list' ? 'list-view' : ''}`}>{items.filter(item => item.category === category).map(item => <AttributeCard key={item.name} item={item} list={view === 'list'} selected={!!selected[item.category]?.includes(item.name)} onToggle={() => toggle(item.category, item.name)} onPreview={() => setPreview(item)} />)}</div></section>)}
      </main>
      <aside className={`prompt-panel ${promptOpen ? 'is-open' : ''}`} aria-label="Prompt composer"><button className="prompt-mobile-toggle" aria-expanded={promptOpen} onClick={() => setPromptOpen(!promptOpen)}><span>Your prompt <span className="count-pill">{selectedCount}</span></span><Icon name="chevron" size={18} /></button><div className="prompt-content"><div className="prompt-heading"><h2>Your prompt</h2><span className="count-pill">{selectedCount}</span></div><div className="selection-list">{selectedCount === 0 ? <p className="selection-empty">No attributes selected</p> : Object.entries(selected).map(([category, values]) => <div className="selection-group" key={category}><span>{CATEGORY_META[category]?.label}</span><div>{values.map(name => <button className="selected-chip" key={name} onClick={() => toggle(category, name)} aria-label={`Remove ${name}`}><span>{name}</span><Icon name="close" size={12} /></button>)}</div></div>)}</div>{selectedCount > 0 && <button className="clear-selections" onClick={() => setSaved({})}>Clear all selections</button>}<label className="output-label" htmlFor="prompt-output">Prompt text</label><textarea id="prompt-output" readOnly rows={6} value={subject.trim() || selectedCount ? prompt : ''} placeholder="Your prompt will appear here." /><div className="prompt-footer"><span>{subject.trim() || selectedCount ? prompt.length : 0} characters</span>{storageError && <span role="alert">Couldn’t save on this device</span>}</div><CopyButton text={prompt} disabled={!subject.trim() && !selectedCount} /></div></aside>
    </div>
    {preview && <ImageViewer item={preview} onClose={() => setPreview(null)} selected={!!selected[preview.category]?.includes(preview.name)} onToggle={() => toggle(preview.category, preview.name)} position={previewIndex} total={items.length} onPrevious={previewIndex >= 0 ? () => movePreview(-1) : null} onNext={previewIndex >= 0 ? () => movePreview(1) : null} />}
    <SearchShortcut />
  </>
}
function SearchShortcut() {
  useEffect(() => {
    const handle = event => { if (event.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName) && !document.querySelector('dialog[open]')) { event.preventDefault(); document.querySelector('[aria-label="Search all attributes"]')?.focus() } }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [])
  return null
}
