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

  public function projects()
  {
    $data = $this->model("Project_model")->getAll();
    echo json_encode($data);
  }

  // get rating of each project (name, avg_rate, total_rate)
  public function ratings()
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

  public function getrate($req = []) {
    $user_id = $req['user_id'] ?? null;
    $project_id = $req['project_id'] ?? null;
    $data = $this->model("Rating_model")->getRate($project_id, $user_id);
    echo json_encode($data);
  }

  public function rate()
  {
    if($_SERVER['REQUEST_METHOD'] !== 'POST') {
      http_response_code(405);
      echo json_encode(['error' => 'method_not_allowed', 'message' => 'Method not allowed']);
      return;
    }

    $req = json_decode(file_get_contents('php://input'), true);
    $project_id = $req['project_id'] ?? null;
    $rate = $req['rating'] ?? null;
    $user_id = $this->getAuthUser()->sub ?? null;

    $ok = $this->model("Rating_model")->getRate($project_id, $user_id);
    if ($ok) { // update
      $result = $this->model("Rating_model")->update($user_id, $project_id, $rate);
      http_response_code(201);
      echo json_encode(['success' => true, 'message' => 'Rating updated', 'data' => $result]);
    } else {
      $data = $this->model("Rating_model")->store($user_id, $project_id, $rate);
      http_response_code(200);
      echo json_encode(['success' => true, 'message' => 'Rating saved', 'data' => $data]);
    }
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