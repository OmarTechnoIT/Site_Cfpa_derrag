-- Base de données pour l'application "Suivi des Apprentis" (ApprentiTrack)
-- Généré par Antigravity

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS apprenti_track_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE apprenti_track_db;

-- ---------------------------------------------------------
-- 1. Table des Spécialités
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS specialties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 2. Table des Employeurs (Entreprises)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS employers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    sector VARCHAR(100),
    responsible VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 3. Table des Apprentis
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS apprentices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    specialty_id INT,
    employer_id INT,
    progress INT DEFAULT 0,
    current_semester VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE SET NULL,
    FOREIGN KEY (employer_id) REFERENCES employers(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 4. Table des Évaluations (Visites de suivi)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    apprentice_id INT NOT NULL,
    visit_date DATE NOT NULL,
    semester VARCHAR(20),
    note_tech DECIMAL(4, 2),
    note_comp DECIMAL(4, 2),
    note_avg DECIMAL(4, 2),
    status VARCHAR(50),
    observations TEXT,
    conclusions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (apprentice_id) REFERENCES apprentices(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- 5. Table des Utilisateurs (Authentification)
-- ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin'
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- DONNÉES INITIALES (MOCK DATA)
-- ---------------------------------------------------------

-- Spécialités
INSERT INTO specialties (name) VALUES 
('Développement Web'),
('Plomberie'),
('Électricité Auto'),
('Horticulture'),
('Menuiserie');

-- Employeurs
INSERT INTO employers (name, sector, responsible, phone) VALUES 
('TechSolutions DZ', 'Informatique', 'M. Ahmed', '0550 11 22 33'),
('BatiPro', 'Construction', 'M. Karim', '0550 44 55 66'),
('AutoDiag', 'Automobile', 'M. Lyes', '0550 77 88 99'),
('Pépinière Verte', 'Agriculture', 'Mme. Sarah', '0550 22 33 44'),
('Bois d''Or', 'Menuiserie', 'M. Yacine', '0550 55 66 77');

-- Apprentis (Lien avec spécialités et employeurs par IDs)
INSERT INTO apprentices (name, specialty_id, employer_id, progress, current_semester) VALUES 
('Amina Benali', 1, 1, 75, 'semester_2'),
('Karim Zidane', 2, 2, 40, 'semester_1'),
('Sarah Mansouri', 3, 3, 20, 'semester_1'),
('Yacine Brahimi', 4, 4, 90, 'semester_4'),
('Lyes Mahrez', 5, 5, 60, 'semester_3');

-- Évaluations
INSERT INTO evaluations (apprentice_id, visit_date, semester, note_tech, note_comp, note_avg, status, observations, conclusions) VALUES 
(1, '2026-04-29', 'semester_2', 9.0, 8.0, 8.5, 'Excellent', 'Très bonne progression.', 'Continuer sur cette lancée.'),
(2, '2026-04-25', 'semester_1', 6.0, 6.0, 6.0, 'Moyen', 'Doit être plus ponctuel.', 'Point à surveiller.'),
(3, '2026-04-22', 'semester_1', 4.0, 5.0, 4.5, 'En difficulté', 'Difficultés techniques.', 'Besoin de renforcement.'),
(4, '2026-04-18', 'semester_4', 9.0, 9.0, 9.0, 'Excellent', 'Excellent travail.', 'Rien à signaler.');

-- Utilisateur par défaut (admin / admin123 - hash d'exemple)
INSERT INTO users (username, password_hash) VALUES 
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
