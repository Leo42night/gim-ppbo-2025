<?php
namespace App\Controllers;

use App\Core\Controller;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=utf-8");

class Api extends Controller
{

  public function index()
  {
    echo "API Kelas PBO 2025";
  }

  public function users()
  {
    $data = $this->model("User_model")->getAll();
    echo json_encode($data);
  }

  public function projects($req = [])
  {
    $id = $req['id'] ?? null;
    if ($id) {
      $data = $this->model("Project_model")->getById($id);
      echo json_encode($data);
      return;
    } else {
      $data = $this->model("Project_model")->getAll();
      echo json_encode($data);
    }
  }

  // get rating of each project (name, avg_rate, total_rate)
  public function rating()
  {
    $data = $this->model("Project_model")->getRatingProjects();
    echo json_encode($data);
  }

  public function me()
  {
    header("Content-Type: application/json; charset=utf-8");

    $u = self::getAuthUser();

    if (!$u) {
      http_response_code(401);
      echo json_encode(['error' => 'unauthenticated', 'message' => 'User not logged in']);
      return;
    }

    echo json_encode([
      'id' => $u->sub,
      'email' => $u->email,
      'name' => $u->name,
      'picture' => $u->picture,
    ]);
  }


  // utilities
  public static function getAuthUser()
  {
    if (!isset($_COOKIE['auth_token']))
      return null;

    try {
      $secret = JWT_SECRET;
      return JWT::decode($_COOKIE['auth_token'], new Key($secret, 'HS256'));
    } catch (\Exception $e) {
      return null;
    }
  }
}