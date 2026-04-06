FROM php:8.2-cli-bookworm

ARG VITE_AI_API_URL=http://localhost:5000
ENV COMPOSER_ALLOW_SUPERUSER=1
ENV VITE_AI_API_URL=${VITE_AI_API_URL}

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        git \
        libpq-dev \
        nodejs \
        npm \
        postgresql-client \
        unzip \
        zip \
    && docker-php-ext-install pdo_pgsql pgsql \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN composer install --no-interaction --prefer-dist --optimize-autoloader \
    && npm ci \
    && npm run build \
    && chmod +x docker/laravel/start.sh

EXPOSE 8000

CMD ["sh", "docker/laravel/start.sh"]
