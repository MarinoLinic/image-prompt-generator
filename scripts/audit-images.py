"""Verify coverage and render labeled contact sheets for visual review."""
import argparse
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--review-dir', required=True, type=Path)
parser.add_argument('--complete', action='store_true')
args = parser.parse_args()
args.review_dir.mkdir(parents=True, exist_ok=True)
words = json.loads((ROOT / 'public/words.json').read_text(encoding='utf-8'))
ledger = json.loads((ROOT / 'docs/image-generation.json').read_text(encoding='utf-8'))
missing = []
errors = []
assets_by_id = {asset['id']: asset for asset in ledger['assets']}
for job in ledger['jobs']:
    asset = assets_by_id.get(job.get('assetId', job['id']))
    if asset and (job['transparent'] or job.get('assetId') == 'reference-fox') and not asset.get('hasAlpha'):
        errors.append(f"Expected transparent alpha: {job['name']}")
font = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 13)
small = ImageFont.truetype('C:/Windows/Fonts/segoeui.ttf', 11)
for index, (category, items) in enumerate(words.items()):
    sheet = Image.new('RGB', (1000, ((len(items) + 5) // 6) * 180 + 45), '#f7f8f6')
    draw = ImageDraw.Draw(sheet)
    draw.text((12, 10), category, font=font, fill='#27372e')
    for i, (name, item) in enumerate(items.items()):
        x, y = (i % 6) * 166, (i // 6) * 180 + 40
        if not item['image']:
            missing.append(f'{category}: {name}')
            draw.text((x + 8, y + 60), 'PENDING', font=small, fill='#9c5949')
        else:
            for size in [240, 480, 1280]:
                path = ROOT / 'public' / item['image'].replace('-480.webp', f'-{size}.webp').lstrip('/')
                if not path.exists():
                    errors.append(str(path))
                else:
                    with Image.open(path) as image:
                        image.verify()
            with Image.open(ROOT / 'public' / item['image'].lstrip('/')) as image:
                image = image.convert('RGBA')
                image.thumbnail((150, 145), Image.Resampling.LANCZOS)
                sheet.paste(image, (x + (166 - image.width) // 2, y), image)
        # Wrap long labels without dropping identity.
        text = name
        lines = []
        while len(text) > 24:
            split = text.rfind(' ', 0, 25)
            if split <= 0: split = 24
            lines.append(text[:split]); text = text[split:].lstrip()
        lines.append(text)
        draw.text((x + 7, y + 146), '\n'.join(lines), font=small, fill='#27372e', spacing=1)
    sheet.save(args.review_dir / f'contact-{index + 1:02}.jpg', quality=90)
assets = list((ROOT / 'public/images').glob('*.webp'))
report = {'attributes': sum(len(items) for items in words.values()), 'covered': 167 - len(missing), 'uniqueImages': len(ledger['assets']), 'responsiveFiles': len(assets), 'totalBytes': sum(path.stat().st_size for path in assets), 'missing': missing, 'errors': errors}
(args.review_dir / 'image-audit.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
print(json.dumps(report))
if errors or (args.complete and missing): raise SystemExit(1)
