PHP minimum versi 8.2+

Menjalankan project secara lokal:
```bash
composer run dev
```

```bash
npm run dev
```

Menjalankan project full via Docker termasuk Laravel, React build, Flask AI, dan PostgreSQL:
```bash
docker compose up -d --build
```

Service yang akan aktif:
- Laravel app: http://localhost:8000
- Flask AI: http://localhost:5000
- PostgreSQL: localhost:5432

Saat container Laravel start, proses ini otomatis dijalankan:
- menunggu PostgreSQL siap
- membuat storage link bila belum ada
- menjalankan migration
- menjalankan seeder
- menjalankan Laravel di port 8000

Catatan:
- Flask AI memakai file environment yang sudah ada di flask-openai-whisper/.env
- Seeder dibuat idempotent, jadi aman jika container direstart dan db:seed dijalankan lagi