"""Package the static site and local Media Studio. No third-party Python dependencies.
Webfonts and public media remain remote URLs; font files are never bundled.
"""
from pathlib import Path
import json,re
ROOT=Path(__file__).resolve().parent
S=ROOT/'storefront'
SCRIPTS=['brand.js','config.js','media-overrides.js','owner-data.js','tebex.js','layout.js','site.js','commerce.js','experience.js']
FONT_TAGS='<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600&amp;family=DM+Sans:wght@400;500;600;700&amp;display=swap">'
for p in [S/'index.html',*S.glob('products/*/index.html'),S/'privacy/index.html']:
    text=p.read_text()
    text=re.sub(r'<script defer src="[^"]+"></script>','',text)
    text=re.sub(r'<link[^>]+(?:fonts\.googleapis\.com|fonts\.gstatic\.com|experience\.css)[^>]*>','',text)
    text=text.replace('<link rel="stylesheet" href="site.css">',FONT_TAGS+'<link rel="stylesheet" href="site.css"><link rel="stylesheet" href="experience.css">')
    text=text.replace('</head>',''.join(f'<script defer src="{f}"></script>' for f in SCRIPTS)+'</head>')
    p.write_text(text)
preview=(S/'index.html').read_text()
preview=re.sub(r'<base[^>]*>','',preview)
for f in ['site.css','experience.css']:
    preview=preview.replace(f'<link rel="stylesheet" href="{f}">','<style>'+(S/f).read_text()+'</style>')
preview=re.sub(r'<script defer src="[^"]+"></script>','',preview)
scripts='<script>window.MS_PREVIEW=true;</script>'
for f in SCRIPTS:scripts+='<script>'+(S/f).read_text().replace('</script','<\\/script')+'</script>'
preview=preview.replace('</body>',scripts+'</body>')
(ROOT/'MikeScripts_Server_Owner_Preview.html').write_text(preview)
studio=(S/'media-studio.html').read_text()
studio=studio.replace('<link rel="stylesheet" href="site.css">',FONT_TAGS+'<style>'+(S/'site.css').read_text()+'</style><style>'+(S/'experience.css').read_text()+'</style>')
studio=re.sub(r'<script src="[^"]+"></script>','',studio)
scripts='<script>window.MS_SITE_TEMPLATE='+json.dumps(preview).replace('<','\\u003c')+';</script>'
for f in ['config.js','media-overrides.js','media-studio.js']:scripts+='<script>'+(S/f).read_text().replace('</script','<\\/script')+'</script>'
studio=studio.replace('</body>',scripts+'</body>')
(ROOT/'MikeScripts_Media_Studio_V3.html').write_text(studio)
print(f'Built preview ({len(preview):,} characters), editor, and {len(list(S.glob("products/*/index.html")))} physical product pages.')
