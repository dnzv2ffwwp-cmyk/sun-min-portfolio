from pathlib import Path

base = Path(r'd:\정선민\Furniture homepage practice')
for name in ['list.html', 'product.html']:
    path = base / name
    text = path.read_text(encoding='utf-8')
    start = text.index('<body>')
    main = text.index('<main>')
    replacement = (
        '<body>\n'
        '    <div id="header-wrap">\n'
        '        <!-- header.html 파일의 내용이 들어오는 영역 -->\n'
        '    </div>\n\n'
        '    <main>'
    )
    text = text[:start] + replacement + text[main + len('<main>'):]
    path.write_text(text, encoding='utf-8')
    print(f'{name}: body normalized')
