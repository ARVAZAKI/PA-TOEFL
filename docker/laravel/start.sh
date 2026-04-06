#!/usr/bin/env sh
set -e

cd /var/www/html

echo "Waiting for PostgreSQL at ${DB_HOST}:${DB_PORT}..."
until pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USERNAME}" >/dev/null 2>&1; do
    sleep 2
done

if [ ! -f .env ] && [ -f .env.example ]; then
    cp .env.example .env
fi

if ! grep -q '^APP_KEY=base64:' .env; then
    php artisan key:generate --force
fi

unset APP_KEY

# Avoid database-backed cache clearing before migrations create the required tables.
rm -f bootstrap/cache/*.php
php artisan storage:link || true
php artisan migrate --force
php artisan db:seed --force

exec php artisan serve --host=0.0.0.0 --port=8000
