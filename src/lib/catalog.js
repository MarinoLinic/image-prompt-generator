export const CATEGORY_META = {
  'Art Style': { label: 'Art style', icon: 'palette' },
  'Surface & Material': { label: 'Material', icon: 'cube' },
  'Perspective & Angle': { label: 'Camera & angle', icon: 'camera' },
  Composition: { label: 'Composition', icon: 'frame' },
  Lighting: { label: 'Lighting', icon: 'sun' },
  'Mood & Atmosphere': { label: 'Mood', icon: 'cloud' },
  'Color Palette': { label: 'Color palette', icon: 'colors' },
  'Era & Setting': { label: 'Era & setting', icon: 'building' },
  'Texture & Detail Effects': { label: 'Texture & effects', icon: 'sparkles' },
  'Background & Environment': { label: 'Background', icon: 'landscape' },
}
export const BASELINE = '/images/reference-fox-480.webp'
export const imageSize = (image, size) => image?.replace(/-480\.webp$/, `-${size}.webp`) || ''
export function normalizeSelections(saved, categories) {
  if (!saved || typeof saved !== 'object' || Array.isArray(saved)) return {}
  return Object.fromEntries(Object.entries(categories).map(([category, options]) => [category,
    [...new Set((Array.isArray(saved[category]) ? saved[category] : []).filter(value => typeof value === 'string' && Object.hasOwn(options, value)))],
  ]).filter(([, values]) => values.length))
}
export function filterCatalog(categories, query = '', active = 'Art Style', selected = {}, selectedOnly = false) {
  const q = query.trim().toLowerCase()
  return Object.entries(categories).flatMap(([category, options]) => {
    if (!q && active !== 'all' && category !== active && !selectedOnly) return []
    return Object.entries(options).filter(([name, info]) => (!q || `${name} ${info.description} ${category} ${CATEGORY_META[category]?.label}`.toLowerCase().includes(q)) && (!selectedOnly || selected[category]?.includes(name))).map(([name, info]) => ({ category, name, ...info }))
  })
}
const join = values => values.length < 2 ? values[0] || '' : values.length === 2 ? values.join(' and ') : `${values.slice(0, -1).join(', ')}, and ${values.at(-1)}`
const lower = values => join(values.map(value => value.toLowerCase()))
export function generatePrompt(subject, selected) {
  const entered = subject.trim() || 'subject'
  const definite = /^the\s+/i.test(entered)
  const name = entered.replace(/^(?:a|an|the)\s+/i, '') || 'subject'
  const material = lower(selected['Surface & Material'] || [])
  const lead = material ? `${material} ${name}` : name
  const phrases = []
  const add = (category, make) => { if (selected[category]?.length) phrases.push(make(selected[category])) }
  add('Art Style', values => `in ${join(values.map(value => `${value} style`))}`)
  add('Perspective & Angle', values => `camera: ${lower(values)}`)
  add('Composition', values => `${lower(values)} composition`)
  add('Lighting', values => `lighting: ${lower(values)}`)
  add('Mood & Atmosphere', values => `${lower(values)} atmosphere`)
  add('Color Palette', values => `color palette: ${lower(values)}`)
  add('Era & Setting', values => `${lower(values)} setting`)
  add('Texture & Detail Effects', values => `effects: ${lower(values)}`)
  add('Background & Environment', values => `background: ${lower(values)}`)
  return `${definite ? 'The' : /^[aeiou]/i.test(lead) ? 'An' : 'A'} ${lead}${phrases.length ? `, ${phrases.join(', ')}` : ''}.`
}
