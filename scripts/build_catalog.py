#!/usr/bin/env python3
"""Validate manifests and stage only publishable static files. No dependencies."""
import argparse
import datetime as dt
import json
import re
import shutil
from pathlib import Path, PurePosixPath
from urllib.parse import quote

SLUG = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*\Z")
EXTENSIONS = set(".html .htm .css .js .mjs .json .webmanifest .svg .png .jpg .jpeg .gif .webp .avif .ico .woff .woff2 .ttf .otf .eot .mp4 .webm .mp3 .ogg .wav .vtt .pdf .txt .csv .xml .wasm .glb .gltf".split())
COVERS = {".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"}
DENIED_NAMES = {"dockerfile", "docker-compose.yml", "compose.yml", "package.json", "package-lock.json", "credentials.json", "secrets.json", "config.json", "nginx.conf"}
DENIED_DIRS = {"node_modules", "__pycache__", "vendor"}
FIELDS = {"title", "description", "category", "cover", "date", "visible"}


def public_file(path):
    return (not any(p.startswith('.') or p.lower() in DENIED_DIRS for p in path.parts)
            and path.name.lower() not in DENIED_NAMES
            and (path.suffix.lower() in EXTENSIONS or path.name.upper().startswith(('LICENSE', 'LICENCE', 'COPYING'))))


def no_duplicates(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError('clé JSON dupliquée')
        result[key] = value
    return result


def read_presentation(folder):
    if not SLUG.fullmatch(folder.name):
        raise ValueError(f'{folder.name}: identifiant invalide (minuscules, chiffres, tirets)')
    if not (folder / 'index.html').is_file():
        raise ValueError(f'{folder.name}: index.html requis')
    try:
        manifest = json.loads((folder / 'presentation.json').read_text(encoding='utf-8'), object_pairs_hook=no_duplicates)
    except (ValueError, OSError) as exc:
        raise ValueError(f'{folder.name}: manifeste JSON invalide') from exc
    if not isinstance(manifest, dict) or set(manifest) - FIELDS:
        raise ValueError(f'{folder.name}: objet attendu, propriétés inconnues interdites')
    for key, limit in [('title', 160), ('description', 600), ('category', 80)]:
        value = manifest.get(key, '' if key != 'category' else 'Autres')
        if not isinstance(value, str) or len(value) > limit or any(ord(c) < 32 for c in value):
            raise ValueError(f'{folder.name}: {key} invalide')
        manifest[key] = value.strip()
    if not manifest['title']:
        raise ValueError(f'{folder.name}: title requis')
    manifest['category'] = manifest['category'] or 'Autres'
    if type(manifest.get('visible', True)) is not bool:
        raise ValueError(f'{folder.name}: visible doit être un booléen')
    date = manifest.get('date')
    if date is not None:
        if not isinstance(date, str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', date):
            raise ValueError(f'{folder.name}: date attendue YYYY-MM-DD')
        dt.date.fromisoformat(date)
    base = f'/presentations/{folder.name}/'
    cover = manifest.get('cover')
    if cover is not None:
        if not isinstance(cover, str) or not cover or any(c in cover for c in '\\%?#:'):
            raise ValueError(f'{folder.name}: cover doit être un chemin relatif local')
        path = PurePosixPath(cover)
        if path.is_absolute() or '..' in path.parts or not public_file(path) or path.suffix.lower() not in COVERS:
            raise ValueError(f'{folder.name}: chemin cover interdit')
        target = folder / cover
        if not target.is_file() or not target.resolve().is_relative_to(folder.resolve()):
            raise ValueError(f'{folder.name}: couverture absente ou hors présentation')
        cover = base + quote(cover, safe='/')
    return dict(id=folder.name, url=base, title=manifest['title'], description=manifest['description'],
                category=manifest['category'], date=date, cover=cover, visible=manifest.get('visible', True))


def build(source, dashboard, output):
    source, dashboard, output = map(Path, (source, dashboard, output))
    if output.exists() and any(output.iterdir()):
        raise ValueError('Le répertoire de sortie doit être vide')
    presentations, publish = [], []
    for folder in sorted(source.iterdir()):
        if folder.name.startswith('.') or folder.is_file():
            continue
        if folder.is_symlink():
            raise ValueError(f'{folder.name}: liens symboliques interdits')
        if not (folder / 'presentation.json').exists():
            if not any(p.name != '.gitkeep' for p in folder.iterdir()):
                continue
            raise ValueError(f'{folder.name}: presentation.json requis')
        item = read_presentation(folder)
        for file in sorted(folder.rglob('*')):
            if file.is_symlink():
                raise ValueError(f'{folder.name}: liens symboliques interdits')
            if file.is_file() and public_file(file.relative_to(folder)):
                publish.append((file, Path('presentations') / folder.name / file.relative_to(folder)))
        if item.pop('visible'):
            presentations.append(item)
    presentations.sort(key=lambda p: (p['date'] or '', p['id']), reverse=True)
    output.mkdir(parents=True, exist_ok=True)
    shutil.copytree(dashboard, output, dirs_exist_ok=True)
    for file, relative in publish:
        target = output / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(file, target)
    (output / 'catalog.json').write_text(json.dumps(presentations, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return presentations


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', default='presentations')
    parser.add_argument('--dashboard', default='dashboard')
    parser.add_argument('--output', default='dist')
    args = parser.parse_args()
    try:
        items = build(args.source, args.dashboard, args.output)
    except ValueError as exc:
        parser.exit(1, f'Catalogue : {exc}\n')
    print(f'Catalogue validé : {len(items)} présentation(s) visible(s).')
