# Simple Image Prompt Generator

A small React + Vite app that lists common aesthetic attributes (art styles, materials,
perspectives, lighting, moods, color palettes, eras, texture effects) so you can quickly
compose and copy prompts for AI image generators.

## Usage

```bash
npm install
npm run dev
```

Type a subject, toggle attributes across categories, then copy the generated prompt.
Selections are saved to local storage. Hovering an attribute shows its description —
preview images will appear there too once added.

## Data

Attributes live in `public/words.json`:

```json
{
	"Category Name": {
		"Attribute": { "description": "...", "image": "/images/attribute.png" }
	}
}
```

Add an image path to the `image` field of any attribute to enable hover previews.
