import React, { useState } from 'react'
import Checkbox from './Checkbox'

const Category = ({ title, options, selectedOptions, onToggle }) => {
	const [isOpen, setIsOpen] = useState(true)

	return (
		<div className="category">
			<h3 onClick={() => setIsOpen(!isOpen)} className="category-title">
				{title} {isOpen ? '▼' : '▶'}
			</h3>
			{isOpen && (
				<div className="checkbox-group">
					{options.map((option) => (
						<Checkbox
							key={option}
							label={option}
							checked={selectedOptions.includes(option)}
							onChange={() => onToggle(option)}
						/>
					))}
				</div>
			)}
		</div>
	)
}

export default Category
