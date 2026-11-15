import { useState } from 'react'
import { imageSize } from '../lib/catalog'

const Checkbox = ({ label, checked, onChange, description, image }) => {
	const [showTooltip, setShowTooltip] = useState(false)

	return (
		<div
			className="checkbox-container"
			onMouseEnter={() => setShowTooltip(true)}
			onMouseLeave={() => setShowTooltip(false)}
			onFocus={() => setShowTooltip(true)}
			onBlur={() => setShowTooltip(false)}
		>
			<label className="checkbox">
				<input type="checkbox" checked={checked} onChange={onChange} />
				<span className="checkbox-label">{label}</span>
			</label>
			{showTooltip && (description || image) && (
				<div className="tooltip">
					{image ? (
						<img src={imageSize(image, 240)} srcSet={`${imageSize(image, 240)} 240w, ${imageSize(image, 360)} 360w, ${image} 480w`} sizes="(max-width: 640px) 230px, 240px" alt={label} className="tooltip-image" decoding="async" />
					) : (
						<div className="tooltip-image tooltip-image-placeholder">Image coming soon</div>
					)}
					{description && <p>{description}</p>}
				</div>
			)}
		</div>
	)
}

export default Checkbox
