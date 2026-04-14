import fitz
import os

pdf_path = "C:/xampp/htdocs/gor-pjt2/public/manual-book-gor.pdf"
output_dir = "public"

doc = fitz.open(pdf_path)
for i, page in enumerate(doc):
    pix = page.get_pixmap(dpi=150)
    out = os.path.join(output_dir, f"pdf_page-{i+1}.jpg")
    pix.save(out)
    print(f"Saved: {out}")

print(f"Total: {len(doc)} halaman")