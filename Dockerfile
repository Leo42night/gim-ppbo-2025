# Gunakan PHP dengan Apache
FROM php:8.2-apache

# Install extensions yang diperlukan
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    unzip \
    git \
    && docker-php-ext-install curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Install Composer (resmi, menggunakan installer)
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" \
    && php composer-setup.php --install-dir=/usr/local/bin --filename=composer \
    && php -r "unlink('composer-setup.php');"

# Copy aplikasi ke container
COPY . /var/www/html/

# Set working directory
WORKDIR /var/www/html

# Install Composer dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Konfigurasi Apache untuk Cloud Run
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Expose port 8080 (Cloud Run requirement)
EXPOSE 8080

# Update Apache untuk listen di port 8080
RUN sed -i 's/80/8080/g' /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf

# Start Apache
CMD ["apache2-foreground"]