import React, { useState } from 'react'

const Checkbox = ({ label, checked, onChange, description, image }) => {
	const [showTooltip, setShowTooltip] = useState(false)

	return (
		<div
			className="checkbox-container"
			onMouseEnter={() => setShowTooltip(true)}
			onMouseLeave={() => setShowTooltip(false)}
		>
			<label className="checkbox">
				<input type="checkbox" checked={checked} onChange={onChange} />
				<span className="checkbox-label">{label}</span>
			</label>
			{showTooltip && (description || image) && (
				<div className="tooltip">
					{image ? (
						<img src={image} alt={label} className="tooltip-image" />
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
