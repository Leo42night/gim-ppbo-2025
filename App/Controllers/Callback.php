<?php
namespace App\Controllers;

use App\Core\Controller;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Callback extends Controller
{
  public function index()
  {
    // Ambil state token
    if (!isset($_COOKIE['oauth_state_token'])) {
      die("Invalid session token");
    }

    $secret = JWT_SECRET;
    $jwt = $_COOKIE['oauth_state_token'];

    try {
      $decoded = JWT::decode($jwt, new Key($secret, 'HS256'));
    } catch (\Exception $e) {
      die("Invalid or expired state");
    }

    $storedState = $decoded->state;

    // Validasi state Google
    if (!isset($_GET['state']) || $_GET['state'] !== $storedState) {
      die('Invalid OAuth state');
    }
    $code = $_GET['code'];

    $postData = http_build_query([
      'code' => $code,
      'client_id' => GOOGLE_CLIENT_ID,
      'client_secret' => GOOGLE_CLIENT_SECRET,
      'redirect_uri' => GOOGLE_REDIRECT_URI,
      'grant_type' => 'authorization_code',
    ]);

    $context = stream_context_create([
      'http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
        'content' => $postData,
        'ignore_errors' => true
      ]
    ]);

    $response = file_get_contents(
      'https://oauth2.googleapis.com/token',
      false,
      $context
    );

    if ($response === false) {
      die('Failed to get token');
    }

    $tokenData = json_decode($response, true);

    if (!isset($tokenData['access_token'])) {
      echo "<pre>";
      print_r($tokenData);
      die('Token response invalid');
    }

    $accessToken = $tokenData['access_token'] ?? null;

    if (!$accessToken) {
      die("Failed to get token");
    }

    // Ambil informasi user Google
    $userInfoRaw = file_get_contents("https://www.googleapis.com/oauth2/v2/userinfo?access_token=$accessToken");
    $userInfo = json_decode($userInfoRaw, true);
    // array(8) { ["id"]=> string(21) ["email"]=> string(31) ["verified_email"]=> bool ["name"]=> string ["given_name"]=> string(7) ["family_name"]=> string ["picture"]=> string

    // cek atau Simpan informasi user ke database
    $isUserExist = $this->model('User_model')->getByEmail($userInfo['email']);
    if(!$isUserExist) {
      $this->model('User_model')->store($userInfo);
      $flashCard = "User baru berhasil terdaftar";
    } else {
      $flashCard = "User berhasil login";
    }
    setcookie("flash_card", $flashCard, time() + 60, "/");

    // Buat JWT untuk login user
    $userPayload = [
      'sub' => $userInfo['id'],
      'email' => $userInfo['email'],
      'name' => $userInfo['name'],
      'picture' => $userInfo['picture'],
      'exp' => time() + 86400 // expires 1 hari
    ];

    $userJwt = JWT::encode($userPayload, $secret, 'HS256');

    // Simpan ke cookie HttpOnly
    setcookie("auth_token", $userJwt, [
      'expires' => time() + 86400,
      'httponly' => true,
      'secure' => isset($_SERVER['HTTPS']),
      'path' => '/',
      'samesite' => 'Lax'
    ]);

    // Hapus oauth_state
    setcookie("oauth_state_token", "", time() - 3600, "/");

    // Redirect
    header("Location: " . BASE_URL);
    exit;
  }
}