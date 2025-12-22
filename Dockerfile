FROM php:8.2-apache

# System deps
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    default-mysql-client \
    unzip \
    git \
    && docker-php-ext-install \
        pdo \
        pdo_mysql \
        curl \
    && rm -rf /var/lib/apt/lists/*

# Enable rewrite
RUN a2enmod rewrite

# Install Composer
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
    && rm composer-setup.php

# App dir
WORKDIR /app
COPY . /app

# Install deps
RUN composer install --no-dev --optimize-autoloader

# 🔥 Apache config: DocumentRoot + permission
RUN sed -i 's|/var/www/html|/app/public|g' /etc/apache2/sites-available/000-default.conf \
 && sed -i 's|<VirtualHost \*:80>|<VirtualHost *:8080>|g' /etc/apache2/sites-available/000-default.conf \
 && sed -i 's|/var/www/|/app/|g' /etc/apache2/apache2.conf \
 && printf '<Directory /app/public>\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>\n' >> /etc/apache2/apache2.conf

# Permission filesystem
RUN chown -R www-data:www-data /app \
 && chmod -R 755 /app

# Cloud Run
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf
EXPOSE 8080
ENV PORT=8080

# Listen on 8080
RUN sed -i 's/80/8080/g' /etc/apache2/ports.conf

CMD ["apache2-foreground"]
