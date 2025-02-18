import React, { useState } from 'react'

const Checkbox = ({ label, checked, onChange, description }) => {
	const [showTooltip, setShowTooltip] = useState(false)

	return (
		<div
			className="checkbox-container"
			onMouseEnter={() => setShowTooltip(true)}
			onMouseLeave={() => setShowTooltip(false)}
		>
			<label className="checkbox">
				<input type="checkbox" checked={checked} onChange={onChange} />
				{label}
			</label>
			{showTooltip && description && <div className="tooltip">{description}</div>}
		</div>
	)
}

export default Checkbox
