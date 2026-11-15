"""Build responsive WebP assets from the built-in image generation ledger."""
import json
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
LEDGER = ROOT / 'docs' / 'image-generation.json'
OUT = ROOT / 'public' / 'images'
SIZES = [240, 360, 480, 1280]

def main():
    ledger = json.loads(LEDGER.read_text(encoding='utf-8'))
    existing = {a['id']: a for a in ledger['assets']}
    for asset in existing.values():
        asset.setdefault('builtSource', asset['source'])
    results = list((ROOT / '.local' / 'image-results').glob('*.json'))
    results += list((ROOT / '.local').glob('image-revisions*/*.json'))
    pending = {}
    for result in sorted(results, key=lambda path: (path.stat().st_mtime_ns, str(path))):
        asset = json.loads(result.read_text(encoding='utf-8'))
        asset['source'] = asset['source'].split(' as ')[-1]
        pending[asset['id']] = asset
    for asset in pending.values():
        previous = existing.get(asset['id'], {})
        if previous.get('source') and previous['source'] != asset['source']:
            asset['previousSources'] = list(dict.fromkeys(previous.get('previousSources', []) + [previous['source']]))
            asset['revisions'] = previous.get('revisions', []) + [{
                'source': previous['source'],
                'prompt': previous.get('revisionPrompt') or next((j['prompt'] for j in ledger['jobs'] if j['id'] == asset['id']), ''),
            }]
        existing[asset['id']] = {**existing.get(asset['id'], {}), **asset}
    ledger['assets'] = list(existing.values())
    OUT.mkdir(exist_ok=True)
    for asset in ledger['assets']:
        targets = [OUT / f"{asset['id']}-{size}.webp" for size in SIZES]
        if (asset.get('builtSource') == asset['source'] and all(path.exists() for path in targets)
                and 'hasAlpha' in asset and 'sourceSize' in asset):
            asset['image'] = f"/images/{asset['id']}-480.webp"
            continue
        source = Path(asset['source'])
        if not source.exists():
            raise FileNotFoundError(source)
        image = ImageOps.exif_transpose(Image.open(source)).convert('RGBA')
        asset['sourceSize'] = list(image.size)
        asset['hasAlpha'] = image.getchannel('A').getextrema()[0] < 255
        for size in SIZES:
            target = OUT / f"{asset['id']}-{size}.webp"
            if not target.exists() or asset.get('builtSource') != asset['source']:
                resized = image.copy()
                resized.thumbnail((size, size), Image.Resampling.LANCZOS)
                resized.save(target, 'WEBP', quality=86 if size == 1280 else 80, method=6)
        asset['image'] = f"/images/{asset['id']}-480.webp"
        asset['builtSource'] = asset['source']
    words = json.loads((ROOT / 'public' / 'words.json').read_text(encoding='utf-8'))
    by_id = {asset['id']: asset for asset in ledger['assets']}
    for item in ledger['jobs']:
        asset = by_id.get(item.get('assetId', item['id']))
        if asset:
            words[item['category']][item['name']]['image'] = asset['image']
            if asset.get('revisionPrompt') and item['prompt'] != asset['revisionPrompt']:
                item.setdefault('originalPrompt', item['prompt'])
                item['prompt'] = asset['revisionPrompt']
    LEDGER.write_text(json.dumps(ledger, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    (ROOT / 'public' / 'words.json').write_text(json.dumps(words, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(json.dumps({'assets': len(ledger['assets']), 'covered': sum(bool(i['image']) for c in words.values() for i in c.values()), 'webpBytes': sum(p.stat().st_size for p in OUT.glob('*.webp'))}))

if __name__ == '__main__':
    main()
