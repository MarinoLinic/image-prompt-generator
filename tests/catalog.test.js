import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { filterCatalog, generatePrompt, normalizeSelections, imageSize, CATEGORY_META } from '../src/lib/catalog.js'
const categories = JSON.parse(readFileSync(new URL('../public/words.json', import.meta.url), 'utf8'))
test('all 167 original attributes remain in the ten navigable categories', () => {
  assert.equal(Object.keys(categories).length, 10)
  assert.deepEqual(Object.keys(categories), Object.keys(CATEGORY_META))
  assert.equal(filterCatalog(categories, '', 'all').length, 167)
})
test('saved selections survive migration and malformed entries cannot corrupt prompt state', () => {
  assert.deepEqual(normalizeSelections({ 'Art Style': ['Oil Painting', 'Oil Painting', null, 'not real'], Lighting: 'Moonlit', Obsolete: ['value'] }, categories), { 'Art Style': ['Oil Painting'] })
  for (const value of [null, 'bad', [], 7]) assert.deepEqual(normalizeSelections(value, categories), {})
})
test('search finds descriptions across categories and selected-only filtering retains global selections', () => {
  const results = filterCatalog(categories, 'refraction', 'Lighting')
  assert.ok(results.some(item => item.name === 'Glass' && item.category === 'Surface & Material'))
  const selected = { 'Art Style': ['Oil Painting'], Lighting: ['Moonlit'] }
  assert.equal(filterCatalog(categories, '', 'Composition', selected, true).length, 2)
  assert.equal(filterCatalog(categories, 'moon', 'Composition', selected, true)[0].name, 'Moonlit')
  assert.equal(filterCatalog(categories, 'doesnotexist').length, 0)
})
test('prompt includes every category in stable order and uses article for leading material', () => {
  const selected = Object.fromEntries(Object.entries(categories).map(([category, values]) => [category, [Object.keys(values)[0]]]))
  const prompt = generatePrompt('fox', selected)
  for (const values of Object.values(selected)) assert.ok(prompt.toLowerCase().includes(values[0].toLowerCase()))
  assert.ok(generatePrompt('fox', { 'Surface & Material': ['Iridescent'] }).startsWith('An iridescent fox'))
  assert.equal(generatePrompt('  astronaut  ', {}), 'An astronaut.')
  assert.equal(generatePrompt('', {}), 'A subject.')
  assert.equal(generatePrompt('a woodland fox', { 'Surface & Material': ['Metallic'] }), 'A metallic woodland fox.')
  assert.equal(generatePrompt('The fox', { 'Surface & Material': ['Metallic'] }), 'The metallic fox.')
})
test('every connected preview has real responsive files; full images use a separate URL', () => {
  assert.equal(filterCatalog(categories, '', 'all').filter(item => item.image).length, 167)
  for (const item of filterCatalog(categories, '', 'all').filter(item => item.image)) {
    for (const size of [240, 480, 1280]) assert.ok(existsSync(new URL(`../public${imageSize(item.image, size)}`, import.meta.url)), `${item.name}: ${size}`)
  }
  assert.equal(imageSize('/images/reference-fox-480.webp', 1280), '/images/reference-fox-1280.webp')
})
