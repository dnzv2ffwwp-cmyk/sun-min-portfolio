from pathlib import Path
import re

for filename in ['list.html', 'product.html']:
    path = Path(r'd:\정선민\Furniture homepage practice') / filename
    text = path.read_text(encoding='utf-8')
    text = re.sub(r'(?s)\s*<header class="pc" style="display:none;">.*?\n\s*<main>', '\n    <main>', text, count=1)
    path.write_text(text, encoding='utf-8')
    print(filename, 'cleaned')
