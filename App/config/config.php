<?php

require_once __DIR__ . '/../../vendor/autoload.php';
use Dotenv\Dotenv;

$envPath = dirname(__DIR__, 2); // /app

if (file_exists($envPath . '/.env')) {
  $dotenv = Dotenv::createImmutable($envPath);
  $dotenv->load();
}

$host = $_SERVER['HTTP_HOST'];

$base_url = strpos($host, 'localhost') !== false ?
  "http://$host" : "https://$host";

// ?? will skip error
// ?: will show if key doesn't exist
define('BASE_URL', $base_url);
define('DB_INSTANCE', getenv('DB_INSTANCE') ? getenv('DB_INSTANCE') : $_ENV['DB_INSTANCE'] ?? '');
define('DB_NAME', getenv('DB_NAME') ? getenv('DB_NAME') : $_ENV['DB_NAME'] ?? 'kelas_pbo');
define('DB_USER', getenv('DB_USER') ? getenv('DB_USER') : $_ENV['DB_USER'] ?? 'root');
define('DB_PASSWORD', getenv('DB_PASSWORD') ? getenv('DB_PASSWORD') : $_ENV['DB_PASSWORD'] ?? '');

// Auth
define('GOOGLE_CLIENT_ID', getenv('GOOGLE_CLIENT_ID') ? getenv('GOOGLE_CLIENT_ID') : $_ENV['GOOGLE_CLIENT_ID'] ?? '');
define('GOOGLE_CLIENT_SECRET', getenv('GOOGLE_CLIENT_SECRET') ? getenv('GOOGLE_CLIENT_SECRET') : $_ENV['GOOGLE_CLIENT_SECRET'] ?? '');
define('GOOGLE_REDIRECT_URI', getenv('GOOGLE_REDIRECT_URI') ? getenv('GOOGLE_REDIRECT_URI') : $_ENV['GOOGLE_REDIRECT_URI'] ?? "$base_url/auth/recall");
define('JWT_SECRET', getenv('JWT_SECRET') ? getenv('JWT_SECRET') : $_ENV['JWT_SECRET'] ?? '');
// echo getenv('TEST') ?? 'gagal'; // untuk dev jika ingin test .env ter load
// var_dump(getenv('TEST') ? getenv('TEST') : $_ENV['TEST'] ?? 'gagal');
// die();