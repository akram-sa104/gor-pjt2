from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm, cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

output_path = "C:/xampp/htdocs/gor-pjt2/public/manual-book-gor.pdf"

doc = SimpleDocTemplate(output_path, pagesize=A4,
    topMargin=2*cm, bottomMargin=2*cm, leftMargin=2.5*cm, rightMargin=2.5*cm)

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleCustom', parent=styles['Title'], fontSize=24, spaceAfter=6, textColor=colors.HexColor('#1a4a6e')))
styles.add(ParagraphStyle(name='SubTitle', parent=styles['Normal'], fontSize=14, spaceAfter=20, alignment=TA_CENTER, textColor=colors.HexColor('#4a5568')))
styles.add(ParagraphStyle(name='Heading2Custom', parent=styles['Heading2'], fontSize=16, spaceBefore=16, spaceAfter=8, textColor=colors.HexColor('#1a4a6e')))
styles.add(ParagraphStyle(name='BodyCustom', parent=styles['Normal'], fontSize=11, leading=16, alignment=TA_JUSTIFY, spaceAfter=8))
styles.add(ParagraphStyle(name='StepTitle', parent=styles['Normal'], fontSize=12, leading=16, textColor=colors.HexColor('#1a4a6e'), fontName='Helvetica-Bold', spaceAfter=4))
styles.add(ParagraphStyle(name='StepBody', parent=styles['Normal'], fontSize=10, leading=15, alignment=TA_JUSTIFY, spaceAfter=12, leftIndent=20))
styles.add(ParagraphStyle(name='FAQ_Q', parent=styles['Normal'], fontSize=11, fontName='Helvetica-Bold', spaceAfter=2, textColor=colors.HexColor('#2d3748')))
styles.add(ParagraphStyle(name='FAQ_A', parent=styles['Normal'], fontSize=10, leading=14, spaceAfter=12, leftIndent=15, textColor=colors.HexColor('#4a5568')))

story = []

# Cover page
story.append(Spacer(1, 80))
story.append(Paragraph("MANUAL BOOK", styles['TitleCustom']))
story.append(Paragraph("GOR Jasa Tirta II", styles['TitleCustom']))
story.append(Spacer(1, 20))
story.append(HRFlowable(width="60%", thickness=2, color=colors.HexColor('#1a4a6e'), spaceAfter=20))
story.append(Paragraph("Panduan Lengkap Booking Lapangan Online", styles['SubTitle']))
story.append(Spacer(1, 40))
story.append(Paragraph("Sistem Booking Online GOR Jasa Tirta II", styles['BodyCustom']))
story.append(Paragraph("Dokumen ini berisi panduan langkah demi langkah untuk melakukan pemesanan lapangan secara online melalui website GOR Jasa Tirta II.", styles['BodyCustom']))
story.append(PageBreak())

# Daftar Isi
story.append(Paragraph("Daftar Isi", styles['Heading2Custom']))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceAfter=12))
toc = [
    "1. Registrasi Akun",
    "2. Login",
    "3. Pilih Lantai",
    "4. Pilih Olahraga dan Tanggal",
    "5. Pilih Jam",
    "6. Konfirmasi Booking",
    "7. Tunggu Persetujuan",
    "8. Beri Review",
    "9. Informasi Lantai dan Fasilitas",
    "10. Pertanyaan Umum (FAQ)",
]
for item in toc:
    story.append(Paragraph(item, styles['BodyCustom']))
story.append(PageBreak())

# Steps
steps = [
    ("1. Registrasi Akun",
     "Buat akun terlebih dahulu dengan mengklik tombol 'Register' di halaman utama. Isi nama lengkap, email, nomor telepon, dan password. Setelah berhasil, Anda akan diarahkan ke halaman login."),
    ("2. Login",
     "Masuk ke akun Anda menggunakan email dan password yang sudah didaftarkan. Jika lupa password, gunakan fitur 'Lupa Password' untuk mereset."),
    ("3. Pilih Lantai",
     "Di halaman Booking, pilih lantai yang tersedia. Lantai 1 untuk Yoga, Senam, dan Tenis Meja. Lantai 2 untuk Futsal, Voli, Badminton, dan Basket. Setiap lantai hanya memiliki 1 area multifungsi."),
    ("4. Pilih Olahraga dan Tanggal",
     "Pilih jenis olahraga yang ingin dilakukan, lalu tentukan tanggal booking. Pastikan memilih tanggal yang belum penuh."),
    ("5. Pilih Jam",
     "Pilih rentang waktu yang diinginkan. Klik slot jam untuk booking minimal 1 jam. Klik slot tambahan untuk memperpanjang durasi. Slot berwarna merah berarti sudah terisi."),
    ("6. Konfirmasi Booking",
     "Periksa kembali detail booking Anda (lantai, olahraga, tanggal, jam). Tambahkan catatan jika perlu, lalu klik 'Booking Sekarang'. Status awal booking adalah 'Pending'."),
    ("7. Tunggu Persetujuan",
     "Admin akan mereview dan menyetujui/menolak booking Anda. Anda akan menerima notifikasi saat status booking berubah. Cek notifikasi di ikon lonceng pada navbar."),
    ("8. Beri Review",
     "Setelah booking selesai dan disetujui, Anda dapat memberikan rating dan review untuk pengalaman Anda. Review membantu kami meningkatkan pelayanan."),
]

story.append(Paragraph("Langkah-Langkah Booking", styles['Heading2Custom']))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceAfter=12))
for title, body in steps:
    story.append(Paragraph(title, styles['StepTitle']))
    story.append(Paragraph(body, styles['StepBody']))
story.append(PageBreak())

# Informasi Lantai
story.append(Paragraph("Informasi Lantai dan Fasilitas", styles['Heading2Custom']))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceAfter=12))

table_data = [
    ["Lantai", "Olahraga", "Keterangan"],
    ["Lantai 1", "Yoga, Senam, Tenis Meja", "Area serbaguna indoor"],
    ["Lantai 2", "Futsal, Voli, Badminton, Basket", "Lapangan utama"],
]
t = Table(table_data, colWidths=[80, 180, 180])
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a4a6e')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 10),
    ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e0')),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f7fafc')]),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('LEFTPADDING', (0, 0), (-1, -1), 10),
]))
story.append(t)
story.append(Spacer(1, 20))

story.append(Paragraph("<b>Penting:</b> Setiap lantai hanya memiliki 1 area multifungsi. Jika sudah ada booking pada jam tertentu di satu lantai, lantai tersebut tidak dapat digunakan sampai booking selesai.", styles['BodyCustom']))
story.append(PageBreak())

# Status Booking
story.append(Paragraph("Status Booking", styles['Heading2Custom']))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceAfter=12))

status_data = [
    ["Status", "Keterangan"],
    ["Pending", "Menunggu persetujuan admin"],
    ["Approved", "Booking telah disetujui"],
    ["Rejected", "Booking ditolak oleh admin"],
    ["Cancelled", "Dibatalkan oleh pengguna"],
]
t2 = Table(status_data, colWidths=[100, 340])
t2.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1a4a6e')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
    ('FONTSIZE', (0, 0), (-1, -1), 10),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e0')),
    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f7fafc')]),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ('LEFTPADDING', (0, 0), (-1, -1), 10),
]))
story.append(t2)
story.append(PageBreak())

# FAQ
story.append(Paragraph("Pertanyaan Umum (FAQ)", styles['Heading2Custom']))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceAfter=12))

faqs = [
    ("Berapa minimal durasi booking?", "Minimal 1 jam. Anda bisa booking dari 1 jam hingga beberapa jam sekaligus."),
    ("Apakah bisa booking di lantai yang sama pada jam yang sudah terisi?", "Tidak. Karena setiap lantai hanya memiliki 1 area multifungsi, jika sudah ada booking pada jam tertentu, lantai tersebut tidak tersedia sampai booking selesai."),
    ("Bagaimana cara membatalkan booking?", "Buka Dashboard > Riwayat Booking, lalu klik tombol 'Batalkan' pada booking yang masih berstatus Pending."),
    ("Kapan booking saya disetujui?", "Admin akan mereview booking Anda dan memberikan persetujuan. Anda akan menerima notifikasi saat status berubah."),
    ("Olahraga apa saja yang tersedia?", "Lantai 1: Yoga, Senam, Tenis Meja. Lantai 2: Futsal, Voli, Badminton, Basket."),
]
for q, a in faqs:
    story.append(Paragraph(f"Q: {q}", styles['FAQ_Q']))
    story.append(Paragraph(f"A: {a}", styles['FAQ_A']))

# Footer info
story.append(Spacer(1, 30))
story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#e2e8f0'), spaceAfter=12))
story.append(Paragraph("GOR Jasa Tirta II - Sistem Booking Online", ParagraphStyle(name='FooterInfo', parent=styles['Normal'], fontSize=9, alignment=TA_CENTER, textColor=colors.HexColor('#a0aec0'))))

doc.build(story)
print("PDF generated successfully")
PY
python /tmp/gen_pdf.py