import { imageSize } from '../lib/catalog'

export default function InlineAttribute({ label, checked, onChange, description, image, onPreview, priority }) {
  return <article className={`visual-attribute ${checked ? 'is-selected' : ''}`}>
    <label className="visual-attribute-label">
      <span className="visual-attribute-heading"><input type="checkbox" checked={checked} onChange={onChange} /><span>{label}</span></span>
      <span className="visual-attribute-image">
        <img src={imageSize(image, 240)} srcSet={`${imageSize(image, 240)} 240w, ${imageSize(image, 360)} 360w, ${image} 480w`} sizes="(max-width: 640px) calc((100vw - 116px) / 2), (max-width: 657px) calc((100vw - 148px) / 2), (max-width: 851px) calc((100vw - 184px) / 3), (max-width: 959px) calc((100vw - 220px) / 4), 185px" width="480" height="480" loading={priority ? 'eager' : 'lazy'} decoding="async" alt="" />
      </span>
    </label>
    <p className="visual-attribute-description">{description}</p>
    <button className="visual-attribute-enlarge" onClick={onPreview} aria-label={`Enlarge ${label}`}>Enlarge image <span aria-hidden="true">↗</span></button>
  </article>
}
