<?php
var_dump(PDO::getAvailableDrivers());
exit;

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/Core/Database.php';
require_once __DIR__ . '/Core/Controller.php';
require_once __DIR__ . '/Core/App.php';