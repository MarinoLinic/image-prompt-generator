import { imageSize } from '../lib/catalog'
import Icon from './Icon'
export default function AttributeCard({ item, selected, onToggle, onPreview, list }) {
  return <article className={`attribute-card ${selected ? 'is-selected' : ''} ${list ? 'is-list' : ''}`}>
    <button className="attribute-image checkerboard" onClick={onPreview} aria-label={`Preview ${item.name}`}>
      {item.image ? <img src={imageSize(item.image, 240)} srcSet={`${imageSize(item.image, 240)} 240w, ${item.image} 480w`} sizes={list ? '64px' : '(max-width: 600px) 45vw, 220px'} width="480" height="480" loading="lazy" decoding="async" alt={`${item.name}: seated fox reference`} /> : <span className="image-pending">Preview pending</span>}
      <span className="expand-image"><Icon name="expand" size={16} /></span>
    </button>
    <button className="attribute-select" aria-pressed={selected} onClick={onToggle}>
      <span className="attribute-copy"><span className="attribute-name">{item.name}</span><span className="attribute-description">{item.description}</span></span>
      <span className={`selection-check ${selected ? 'checked' : ''}`}>{selected && <Icon name="check" size={13} />}</span>
    </button>
  </article>
}
