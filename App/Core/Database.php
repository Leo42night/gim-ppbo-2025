<?php

class Database
{
  private $instance = DB_INSTANCE; // project:region:instance
  private $name = DB_NAME;
  private $user = DB_USER;
  private $pass = DB_PASSWORD;
  private $dbh;
  private $stmt;

  public function __construct()
  {
    $dsn = sprintf(
      'mysql:unix_socket=/cloudsql/%s;dbname=%s;charset=utf8mb4',
      $this->instance,
      $this->name
    );

    $options = [
      PDO::ATTR_PERSISTENT => true,
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ];

    try {
      if (getenv('K_SERVICE')) {
        // Cloud Run
        $dsn = "mysql:unix_socket=/cloudsql/{$this->instance};dbname={$this->name}";
      } else {
        // Local
        $dsn = "mysql:host=localhost;port=3306;dbname={$this->name}";
      }

      $this->dbh = new PDO($dsn, $this->user, $this->pass, $options);
    } catch (PDOException $e) {
      die('DB Connection failed: ' . $e->getMessage());
    }
  }

  public function query($query)
  {
    $this->stmt = $this->dbh->prepare($query);
  }

  public function bind($param, $value, $type = null)
  {
    if (is_null($type)) {
      switch (true) {
        case is_int($value):
          $type = PDO::PARAM_INT;
          break;
        case is_bool($value):
          $type = PDO::PARAM_BOOL;
          break;
        case is_null($value):
          $type = PDO::PARAM_NULL;
          break;
        default:
          $type = PDO::PARAM_STR;
      }
    }

    $this->stmt->bindValue($param, $value, $type);
  }

  public function execute()
  {
    $this->stmt->execute();
  }

  public function resultSet()
  {
    $this->execute();
    return $this->stmt->fetchAll(PDO::FETCH_ASSOC);
  }

  public function single()
  {
    $this->execute();
    return $this->stmt->fetch(PDO::FETCH_ASSOC);
  }

  public function rowCount()
  {
    return $this->stmt->rowCount();
  }
}