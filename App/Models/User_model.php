<?php 
// postfix _model agar tidak tabrakan dengan class di controller (keduanya bisa di require bersamaan)
class User_model {
    private $table = 'users';
    private $db;
    
    public function __construct(){
      $this->db = new Database;
    }
    public function getAll() {
        $this->db->query('SELECT * FROM '.$this->table);
        return $this->db->resultSet();
    }
    public function getById($id) {
        $this->db->query('SELECT * FROM '.$this->table." WHERE id = :id");
        $this->db->bind('id',$id);
        return $this->db->single();
    }

    public function getByEmail($email) {
        $this->db->query('SELECT * FROM '.$this->table." WHERE email = :email");
        $this->db->bind('email',$email);
        return $this->db->single();
    }

    public function store($data) {
        $sql = "INSERT INTO ".$this->table." (`name`, `email`, `picture`) VALUES (:name, :email, :picture)";
        $this->db->query($sql);
        $this->db->bind('name',$data['name']);
        $this->db->bind('email',$data['email']);
        $this->db->bind('picture',$data['picture']);
        $this->db->execute();
        return $this->db->rowCount();
    }
}