import React, { useState, useEffect } from 'react'
import Checkbox from './Checkbox'

const Category = ({ title, options, selectedOptions, onToggle, forceOpen }) => {
	const [isOpen, setIsOpen] = useState(false)

	useEffect(() => {
		if (forceOpen) setIsOpen(true)
	}, [forceOpen])

	return (
		<div className="category">
			<button className="category-title" onClick={() => setIsOpen(!isOpen)}>
				<span>{title}</span>
				<span className="category-meta">
					{selectedOptions.length > 0 && <span className="badge">{selectedOptions.length}</span>}
					<span className={`chevron ${isOpen ? 'open' : ''}`}>▸</span>
				</span>
			</button>
			{isOpen && (
				<div className="checkbox-group">
					{options.map(([option, info]) => (
						<Checkbox
							key={option}
							label={option}
							checked={selectedOptions.includes(option)}
							onChange={() => onToggle(option)}
							description={info.description}
							image={info.image}
						/>
					))}
				</div>
			)}
		</div>
	)
}

export default Category
