FROM php:8.2-apache

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    curl \
    libxml2-dev \
    libzip-dev \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libonig-dev \
    libssl-dev \
    git \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Instalar extensões PHP necessárias para sped-nfe
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        dom \
        gd \
        mbstring \
        soap \
        xml \
        zip \
        pdo \
        pdo_mysql \
        openssl

# Habilitar mod_rewrite do Apache
RUN a2enmod rewrite

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Definir diretório de trabalho
WORKDIR /var/www/html

# Copiar arquivos de configuração do Composer
COPY composer.json composer.lock* ./

# Instalar dependências PHP
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Copiar código da aplicação
COPY . .

# Configurar Apache
COPY apache.conf /etc/apache2/sites-available/000-default.conf

# Definir permissões
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Expor porta
EXPOSE 80

# Comando padrão
CMD ["apache2-foreground"]
