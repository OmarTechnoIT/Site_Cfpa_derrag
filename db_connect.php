<?php
// db_connect.php - Connexion à la base de données MySQL

$host = "localhost";
$dbname = "apprenti_track_db";
$username = "root";
$password = "";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    // Configurer PDO pour lever des exceptions en cas d'erreur
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Configurer PDO pour retourner les résultats sous forme de tableau associatif par défaut
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    // En cas d'erreur de connexion, retourner un message JSON
    header('Content-Type: application/json');
    die(json_encode([
        "status" => "error",
        "message" => "Erreur de connexion à la base de données : " . $e->getMessage()
    ]));
}
?>
