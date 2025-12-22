<?php
namespace App\Controllers;

use App\Core\Controller;

class Home extends Controller {
  public function index() {
    $this->view('templates/header');
    $this->view('index');
    $this->view('templates/footer');
  }
}