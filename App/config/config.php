<?php 

require_once __DIR__ . '/../../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__  . '/../../'); // .env di root
$dotenv->load();

$host = $_SERVER['HTTP_HOST'];

$base_url = strpos($host, 'localhost') !== false ? 
  "http://$host" : "https://$host";

// ?? will skip error
// ?: will show if key doesn't exist
define('BASE_URL', $base_url);
define('DB_NAME', $_ENV['DB_NAME'] ?? 'kelas_pbo');
define('DB_USER', $_ENV['DB_USER'] ?? 'root');
define('DB_PASS', $_ENV['DB_PASS'] ?? '');

// Auth
define('GOOGLE_CLIENT_ID', $_ENV['GOOGLE_CLIENT_ID'] ?? '');
define('GOOGLE_CLIENT_SECRET', $_ENV['GOOGLE_CLIENT_SECRET'] ?? '');
define('GOOGLE_REDIRECT_URI', $_ENV['GOOGLE_REDIRECT_URI'] ?? "$base_url/callback");
define('JWT_SECRET', $_ENV['JWT_SECRET'] ?? '');
// echo $_ENV['TEST'] ?? 'gagal'; // untuk dev jika ingin test .env ter load