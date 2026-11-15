import { useEffect, useRef } from 'react'
import { imageSize } from '../lib/catalog'

export default function ImagePreview({ item, onClose, selected, onToggle }) {
  const dialog = useRef(null)
  useEffect(() => {
    const element = dialog.current
    const previousFocus = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    element.showModal()
    return () => {
      element.close()
      document.body.style.overflow = overflow
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus({ preventScroll: true })
    }
  }, [])

  return <dialog ref={dialog} className="attribute-preview" aria-labelledby="attribute-preview-title" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <header className="attribute-preview-header"><h2 id="attribute-preview-title">{item.name}</h2><button onClick={onClose} aria-label="Close image preview">×</button></header>
    <div className="attribute-preview-image"><img src={imageSize(item.image, 1280)} alt={`${item.name} fox example`} width="1280" height="1280" /></div>
    <p>{item.description}</p>
    <button className="attribute-preview-select" aria-pressed={selected} onClick={onToggle}>{selected ? 'Remove attribute' : 'Select attribute'}</button>
  </dialog>
}
