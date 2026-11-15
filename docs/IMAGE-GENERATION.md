# Image-generation contract

This is the maintained instruction set for new sessions. Read it before using the prompt ledger. The user's November 15 update supersedes the earlier rule that every category must show an unchanged clay figurine.

## Shared defaults

Use `docs/reference/fox-master.png` as the identity and pose reference. This original master is bundled in the repository so a new session does not need the prior conversation or a file in `.codex/generated_images`.

| Property | Default |
| --- | --- |
| Identity | Seated fox with pointed ears, short muzzle, small black eyes and nose, large tail curled across the front |
| Color | Terracotta orange, ivory chest/cheeks/inner ears/tail tip, black facial details |
| Medium | Photorealistic product photograph of a matte clay figurine |
| Camera | Eye-level, three-quarter view facing slightly toward image left, approximately 70mm lens |
| Framing | One centered subject, full body, consistent scale and generous margins |
| Light | Neutral soft diffused studio light from upper left |
| Background | Genuine transparent alpha for isolated styles, materials, and palettes; a neutral studio only when the property requires scene/depth cues |
| Other properties | No added era, mood, texture effect, costume, text, logo, border, or duplicate subject |

Change only the demonstrated property where possible. A camera example changes camera/framing, a material example changes the surface, a palette example changes colors, and an art-style example changes the rendering medium while retaining identity, pose, and composition. Named properties sometimes imply coupled changes; record those exceptions instead of claiming exact experimental control. Do not use a baked checkerboard as transparency.

## Era & Setting: fully integrate the character

The fox must belong to the world, not be an unchanged 3D product placed in front of a backdrop. Retain recognizable identity cues: orange/ivory coloring, pointed ears, short muzzle, dark eyes/nose, and a large ivory-tipped tail. Identity is a guide, not a rigid model, silhouette, face, material, or pose; theme-specific character design can diverge when it strengthens integration. The fox may be a living stylized character with fur, a different pose, theme-appropriate clothing/equipment, and a meaningful action. Use a coherent polished cinematic 3D animation treatment across this category. Keep the fox prominent and readable at thumbnail size.

Design role, costume, props, action, architecture, materials, palette, and lighting together. For example, a steampunk fox can repair a steam engine, a medieval fox can cross a castle bridge in a traveling cloak, and an underwater fox can explore a reef with diving equipment. No showroom, product-shot pose, display pedestal, cutout pasted over a scene, or unrelated alternate protagonist. Include the environment as actual scene space with matching light, contact, and perspective. These are illustrative themes, not claims of exact historical reconstruction.

Background & Environment retains the original controlled-subject rule. A forest background example changes the surroundings around the reference figurine; a medieval setting example transforms how the character participates in its world.

## Category decisions and deferred ideas

- **Aqua Glass:** Surface & Material. It describes translucent blue-tinted glass, refraction, rounded highlights, and a wet polished finish. Keep the asset ID stable when moving it and migrate saved selections from its former Texture & Detail Effects location. A material example should use transparent alpha like the other isolated materials.
- **Art Style:** retain the existing examples in this pass. Oil and watercolor are 2D media that can depict a three-dimensional subject; depth alone is not evidence of the wrong medium. Review brushwork, translucent washes, contour, and shape treatment rather than merely flattening the subject. The user raised their dimensional appearance for examination, not as a settled instruction to replace the category.
- **Matte Painting:** keep its existing opaque backdrop for now. It is not part of the isolated-material requirement. No new background change was requested.
- **Pixel Art / Retro Game / 8-bit / 16-bit / VGA:** the user noticed overlap and explicitly said not to change those entries yet. Do not merge, rename, remove, or regenerate them as part of another task.

## Generation and revision workflow

1. Inspect the current catalog, this contract, the bundled master, and the relevant completed examples. Use the installed image-generation skill and built-in image tool. API-key fallback requires the user's explicit choice.
2. Save the exact prompt before generating. Name the reference's role and list what must remain fixed. Apply the era exception only to Era & Setting. Use one tool call per distinct asset.
3. Generate a representative example before committing to a batch. Inspect character identity, actual medium, requested property, framing, unwanted extras, alpha, and scene integration. Correct a failed example rather than changing its label to fit it.
4. Retain the original output; replace only authorized runtime versions. Save new source and prompt metadata in `.local/image-results/<asset-id>.json` or `.local/image-revisions-YYYYMMDD/<asset-id>.json`, using the record format consumed by `scripts/optimize-images.py`. The optimizer picks the newest checkpoint for each asset and merges it into the durable ledger, preserving prior sources and prompts.
5. Build 240px, 360px, 480px, and up-to-1280px WebP variants with their original aspect ratios. Use accurately sized responsive files while browsing; 360px fills the gap for higher-density small displays. Keep HTML `sizes` hints aligned with the actual CSS grid. Verify chosen files and requests at several viewport widths/pixel densities; WebP alone does not prove efficient loading. Load the large version only when explicitly opened. Preserve alpha. Runtime files must be inside the repository.
6. Run `npm run lint`, `npm test`, `npm run build`, and `py scripts/audit-images.py --complete --review-dir <review-folder>`. Inspect contact sheets and representative full images, then check the actual interface on desktop and phone. The audit does not replace visual review.
7. Update the ledger, README, and this contract when the user changes a durable rule. Show a few representative images or contact sheets, never a flood of individual files. Commit/push when requested.

Exact prompts, original and revised source paths, and asset metadata are in `docs/image-generation.json`. Historical outputs outside the repository are provenance, not a runtime dependency. The optimizer reuses already-built variants without opening machine-specific originals; a new or missing variant still needs its recorded source. Keep this human-readable contract authoritative when an older prompt conflicts with a newer user instruction.
