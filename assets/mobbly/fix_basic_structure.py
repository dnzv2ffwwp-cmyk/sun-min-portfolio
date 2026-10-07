from pathlib import Path
import re

base = Path(r'd:\정선민\Furniture homepage practice')
for name in ['list.html', 'product.html']:
    path = base / name
    text = path.read_text(encoding='utf-8')
    text = re.sub(
        r'(?s)<body>\s*<div id="header-wrap">.*?</div>\s*(?:<header class="pc" style="display:none;">.*?</header>\s*)?(?:<div class="smart-header">.*?</div>\s*)?(?:<div class="smart-overlay-menu">.*?</div>\s*)?<main>',
        '<body>\n    <div id="header-wrap">\n        <!-- header.html 파일의 내용이 들어오는 영역 -->\n    </div>\n\n    <main>',
        text,
        count=1,
    )
    path.write_text(text, encoding='utf-8')
    print(f'{name}: normalized')
