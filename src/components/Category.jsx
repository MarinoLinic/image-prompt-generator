import { useState, useEffect, useId } from 'react'
import Checkbox from './Checkbox'
import InlineAttribute from './InlineAttribute'

const Category = ({ title, options, selectedOptions, onToggle, forceOpen, imageView, onPreview }) => {
	const [isOpen, setIsOpen] = useState(false)
	const contentId = useId()

	useEffect(() => {
		if (forceOpen) setIsOpen(true)
	}, [forceOpen])

	return (
		<div className="category">
			<button className="category-title" onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen} aria-controls={contentId}>
				<span>{title}</span>
				<span className="category-meta">
					{selectedOptions.length > 0 && <span className="badge">{selectedOptions.length}</span>}
					<span className={`chevron ${isOpen ? 'open' : ''}`}>▸</span>
				</span>
			</button>
			{isOpen && (
				<div id={contentId} className={imageView ? 'attribute-image-grid' : 'checkbox-group'}>
					{options.map(([option, info], index) => (
						imageView ? <InlineAttribute
							key={option}
							label={option}
							checked={selectedOptions.includes(option)}
							onChange={() => onToggle(option)}
							description={info.description}
							image={info.image}
							priority={index < 4}
							onPreview={() => onPreview({ category: title, name: option, ...info })}
						/> : <Checkbox
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
