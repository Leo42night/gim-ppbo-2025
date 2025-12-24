<?php
namespace App\Core;

class Controller
{
  public function view($view, $data = [])
  {
    require_once __DIR__ . '/../views/' . $view . '.php';
  }

  public function model($model)
  {
    if (file_exists(__DIR__ . "/../Models/" . $model . ".php")) {
    }
    require_once __DIR__ . '/../Models/' . $model . '.php';
    return new $model;
  }

  // Helper
  protected function jsonResponse(int $code, array $payload): void
  {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_SLASHES);
  }
}