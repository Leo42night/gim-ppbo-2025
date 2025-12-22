<?php
// postfix _model agar tidak tabrakan dengan class di controller (keduanya bisa di require bersamaan)
class Rating_model
{
  private $table = 'ratings';
  private $db;

  public function __construct()
  {
    $this->db = new Database;
  }

  public function getRate($project_id, $user_id)
  {
    $this->db->query("SELECT * FROM " . $this->table . " WHERE project_id = :project_id AND user_id = :user_id");
    $this->db->bind('project_id', $project_id);
    $this->db->bind('user_id', $user_id);
    return $this->db->single();
  }

  public function store($user_id, $project_id, $rate)
  {
    $sql = "INSERT INTO " . $this->table . " (`project_id`, `user_id`, `rate`) VALUES (:project_id, :user_id, :rate)";
    $this->db->query($sql);
    $this->db->bind('project_id', $project_id);
    $this->db->bind('user_id', $user_id);
    $this->db->bind('rate', $rate);
    $this->db->execute();
    return $this->db->rowCount();
  }

  public function update($user_id, $project_id, $rate)
  {
    $sql = "UPDATE " . $this->table . " SET rate = :rate WHERE project_id = :project_id AND user_id = :user_id";
    $this->db->query($sql);
    $this->db->bind('project_id', $project_id);
    $this->db->bind('user_id', $user_id);
    $this->db->bind('rate', $rate);
    $this->db->execute();
    return $this->db->rowCount();
  }
}