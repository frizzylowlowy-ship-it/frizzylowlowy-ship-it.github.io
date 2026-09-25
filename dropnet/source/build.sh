set -e
export NODE_PATH=$(npm root -g)
node bg.js; node render.js map.html content.pdf
python3 - <<'PY'
import pymupdf as f
bg=f.open('bg.pdf'); c=f.open('content.pdf'); out=f.open()
for i,pg in enumerate(c):
    np_=out.new_page(width=pg.rect.width,height=pg.rect.height)
    np_.show_pdf_page(np_.rect,bg,0); np_.show_pdf_page(np_.rect,c,i)
out.set_metadata({'title':'Карта проблемы — Дроп.Нет — МБОУ СОШ № 4 г. Большой Камень','author':'Команда МБОУ СОШ № 4'})
out.save('map.pdf',garbage=3,deflate=True); print('pages',len(c))
PY
