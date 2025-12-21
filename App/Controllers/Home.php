<?php
namespace App\Controllers;

use App\Core\Controller;
use App\Controllers\Auth;

class Home extends Controller {
  public function index() {
    // $user = Auth::getAuthUser();
    // $flashCard = $_COOKIE['flash_card'] ?? null;
    // setcookie('flash_card', "", time() - 60, '/');
    // die(var_dump($user));

    $this->view('templates/header');
    // $this->view('index', [
    //   'user' => $user,
    //   'flashCard' => $flashCard
    // ]);
    $this->view('home/index');
    // $this->view('index');
    $this->view('templates/footer');
  }
}