import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'
import { BASELINE, CATEGORY_META, imageSize } from '../lib/catalog'
export default function ImageViewer({ item, onClose, onPrevious, onNext, onToggle, selected, position, total }) {
  const dialog = useRef(null)
  const [compare, setCompare] = useState(true)
  useEffect(() => {
    const element = dialog.current
    const previousFocus = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    element.showModal()
    return () => {
      element.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [])
  const reference = item.name === 'Default reference'
  return <dialog className="image-dialog" ref={dialog} onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose() }} onKeyDown={event => {
    if (event.key === 'ArrowLeft' && onPrevious) { event.preventDefault(); onPrevious() }
    if (event.key === 'ArrowRight' && onNext) { event.preventDefault(); onNext() }
  }} aria-labelledby="viewer-title">
    <div className="viewer-header"><div><span className="eyebrow">{reference ? 'Reference setup' : CATEGORY_META[item.category]?.label}</span><h2 id="viewer-title">{item.name}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close preview"><Icon name="close" /></button></div>
    <div className={`viewer-images ${compare && !reference ? 'comparing' : ''}`}>
      {compare && !reference && <figure><figcaption>Default reference</figcaption><div className="checkerboard"><img src={imageSize(BASELINE, 1280)} width="1280" height="1280" alt="Default terracotta matte clay fox, three-quarter view" /></div></figure>}
      <figure><figcaption>{reference ? 'Default reference' : item.name}</figcaption><div className="checkerboard">{item.image ? <img src={imageSize(item.image, 1280)} width="1280" height="1280" alt={`${item.name} fox example`} /> : <span className="image-pending">Preview pending</span>}</div></figure>
    </div>
    <div className="viewer-description">{reference ? <><p>Matte clay fox · Terracotta & ivory · Three-quarter view</p><p>Photorealistic · Soft diffused light · Transparent background</p></> : <p>{item.description}</p>}</div>
    <div className="viewer-actions">
      {!reference && <label className="compare-toggle"><input type="checkbox" checked={compare} onChange={event => setCompare(event.target.checked)} /> Compare with default</label>}
      {!reference && position >= 0 && total > 0 && <div className="viewer-pagination"><button className="icon-button" onClick={onPrevious} aria-label="Previous example"><Icon name="left" /></button><span>{position + 1} / {total}</span><button className="icon-button" onClick={onNext} aria-label="Next example"><Icon name="right" /></button></div>}
      {!reference && <button className={`primary-button ${selected ? 'selected-button' : ''}`} onClick={onToggle}><Icon name={selected ? 'check' : 'sparkles'} size={17} />{selected ? 'Remove from prompt' : 'Add to prompt'}</button>}
      {reference && <button className="primary-button" onClick={onClose}>Back to attributes</button>}
    </div>
  </dialog>
}
