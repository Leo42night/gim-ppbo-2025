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
}