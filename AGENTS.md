# Image Prompt Generator

Read [README.md](README.md) for the active interface and commands, then [docs/IMAGE-GENERATION.md](docs/IMAGE-GENERATION.md) before creating or replacing images. That document is the project's image-generation contract, including category exceptions and the user's decisions. Exact prompts and asset history live in [docs/image-generation.json](docs/image-generation.json).

- Keep the restored Archivo/IBM Plex Mono, red/black accordion interface. Add requested controls within it; do not reactivate the rejected `PromptBuilder.jsx` / `builder.css` redesign.
- Default examples vary one named property of the same fox. **Era & Setting is the explicit exception:** use the same recognizable fox character fully integrated into the theme through role, clothing, equipment, action, and surroundings. Do not display the unchanged clay figurine on a pedestal in front of themed scenery.
- Preserve all catalog entries. Aqua Glass belongs in Surface & Material; migrate old saved selections from Texture & Detail Effects. Pixel-art variants were raised as a possible future review, with an explicit instruction to leave them alone for now.
- Use the bundled [master reference](docs/reference/fox-master.png). Runtime assets belong in `public/images/`, with 240, 360, 480, and up-to-1280px WebP versions. Preserve alpha where required. Use accurately sized responsive thumbnails while browsing; request the large variant only on enlargement.
- If image-grid geometry changes, update the responsive `sizes` hints in `InlineAttribute.jsx` to match `styles.css`, and verify actual browser requests at representative viewport widths and pixel densities. WebP alone does not prove efficient loading.
- Record the full prompts, reference, category, source, and revision history. Inspect results and run the complete audit before claiming coverage. Do not change unrelated images as a side effect of a UI edit.
- For batches over 15 images, show representative contact sheets or the running catalog rather than sending every image individually. Keep captures in `C:/Users/marin/agent-files/trash/project-reviews/image-prompt-generator/`.
