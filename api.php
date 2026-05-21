<?php
// api.php - API centrale pour l'application ApprentiTrack
header('Content-Type: application/json');
require_once 'db_connect.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'get_all_data':
        try {
            // Récupérer les spécialités
            $stmt = $pdo->query("SELECT * FROM specialties");
            $specialties = $stmt->fetchAll();

            // Récupérer les employeurs
            $stmt = $pdo->query("SELECT * FROM employers");
            $employers = $stmt->fetchAll();

            // Récupérer les apprentis avec leurs relations
            $stmt = $pdo->query("
                SELECT a.*, s.name as spec_name, e.name as employer_name 
                FROM apprentices a
                LEFT JOIN specialties s ON a.specialty_id = s.id
                LEFT JOIN employers e ON a.employer_id = e.id
                ORDER BY a.created_at DESC
            ");
            $apprentices = $stmt->fetchAll();

            // Récupérer les évaluations
            $stmt = $pdo->query("
                SELECT ev.*, a.name as apprentice_name, s.name as spec_name, e.name as employer_name
                FROM evaluations ev
                JOIN apprentices a ON ev.apprentice_id = a.id
                LEFT JOIN specialties s ON a.specialty_id = s.id
                LEFT JOIN employers e ON a.employer_id = e.id
                ORDER BY ev.visit_date DESC, ev.created_at DESC
            ");
            $evaluations = $stmt->fetchAll();

            echo json_encode([
                "status" => "success",
                "data" => [
                    "specialties" => $specialties,
                    "employers" => $employers,
                    "apprentices" => $apprentices,
                    "evaluations" => $evaluations
                ]
            ]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Erreur lors de la récupération des données : " . $e->getMessage()]);
        }
        break;

    case 'save_apprentice':
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data) {
            echo json_encode(["status" => "error", "message" => "Données invalides"]);
            break;
        }

        try {
            // Trouver ou créer la spécialité
            $stmt = $pdo->prepare("SELECT id FROM specialties WHERE name = ?");
            $stmt->execute([$data['spec']]);
            $spec = $stmt->fetch();
            $spec_id = $spec ? $spec['id'] : null;

            if (!$spec_id && !empty($data['spec'])) {
                $stmt = $pdo->prepare("INSERT INTO specialties (name) VALUES (?)");
                $stmt->execute([$data['spec']]);
                $spec_id = $pdo->lastInsertId();
            }

            // Trouver l'employeur par nom
            $stmt = $pdo->prepare("SELECT id FROM employers WHERE name = ?");
            $stmt->execute([$data['company']]);
            $employer = $stmt->fetch();
            $employer_id = $employer ? $employer['id'] : null;

            $stmt = $pdo->prepare("INSERT INTO apprentices (name, specialty_id, employer_id, current_semester, progress) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([
                $data['name'],
                $spec_id,
                $employer_id,
                $data['semester'],
                $data['progress'] ?? 0
            ]);

            echo json_encode(["status" => "success", "id" => $pdo->lastInsertId()]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    case 'save_evaluation':
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            // Trouver l'ID de l'apprenti par son nom
            $stmt = $pdo->prepare("SELECT id FROM apprentices WHERE name = ?");
            $stmt->execute([$data['name']]);
            $apprentice = $stmt->fetch();
            
            if (!$apprentice) {
                echo json_encode(["status" => "error", "message" => "Apprenti non trouvé"]);
                break;
            }

            $stmt = $pdo->prepare("INSERT INTO evaluations (apprentice_id, visit_date, semester, note_tech, note_comp, note_avg, status, observations, conclusions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $apprentice['id'],
                $data['date'],
                $data['semester'],
                $data['noteTech'],
                $data['noteComp'],
                $data['note'],
                $data['status'],
                $data['observations'],
                $data['conclusions']
            ]);

            // Mettre à jour la progression
            $stmt = $pdo->prepare("UPDATE apprentices SET progress = LEAST(100, progress + 20) WHERE id = ?");
            $stmt->execute([$apprentice['id']]);

            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    case 'save_employer':
        $data = json_decode(file_get_contents('php://input'), true);
        try {
            $stmt = $pdo->prepare("INSERT INTO employers (name, sector, responsible, phone) VALUES (?, ?, ?, ?)");
            $stmt->execute([
                $data['name'],
                $data['sector'],
                $data['responsible'],
                $data['phone']
            ]);
            echo json_encode(["status" => "success", "id" => $pdo->lastInsertId()]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    case 'delete_apprentice':
        $name = $_GET['name'] ?? '';
        try {
            $stmt = $pdo->prepare("DELETE FROM apprentices WHERE name = ?");
            $stmt->execute([$name]);
            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    case 'delete_visit':
        $id = $_GET['id'] ?? '';
        try {
            $stmt = $pdo->prepare("DELETE FROM evaluations WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    case 'delete_employer':
        $name = $_GET['name'] ?? '';
        try {
            $stmt = $pdo->prepare("DELETE FROM employers WHERE name = ?");
            $stmt->execute([$name]);
            echo json_encode(["status" => "success"]);
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
        }
        break;

    case 'login':
        $data = json_decode(file_get_contents('php://input'), true);
        $user = $data['username'] ?? '';
        $pass = $data['password'] ?? '';
        
        // Test direct pour admin/admin123 (prioritaire pour le dépannage)
        if ($user === 'admin' && $pass === 'admin123') {
            echo json_encode(["status" => "success"]);
            break;
        }

        try {
            // Vérifier si la table users existe
            $tableCheck = $pdo->query("SHOW TABLES LIKE 'users'")->rowCount();
            if ($tableCheck > 0) {
                $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
                $stmt->execute([$user]);
                $userData = $stmt->fetch();
                
                if ($userData && password_verify($pass, $userData['password_hash'])) {
                    echo json_encode(["status" => "success"]);
                } else {
                    echo json_encode(["status" => "error", "message" => "Identifiants invalides"]);
                }
            } else {
                echo json_encode(["status" => "error", "message" => "La table 'users' n'existe pas. Veuillez importer le fichier database.sql"]);
            }
        } catch (PDOException $e) {
            echo json_encode(["status" => "error", "message" => "Erreur DB: " . $e->getMessage()]);
        }
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Action non reconnue"]);
        break;
}
?>
