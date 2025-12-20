-- ============================================================
-- INITIALISATION DES BASES DE DONNÉES
-- ============================================================
-- Ce script est exécuté automatiquement au premier démarrage
-- de MySQL via Docker
-- ============================================================

-- Créer les bases de données
CREATE DATABASE IF NOT EXISTS user_db;
CREATE DATABASE IF NOT EXISTS inscription_db;
CREATE DATABASE IF NOT EXISTS soutenance_db;
CREATE DATABASE IF NOT EXISTS notification_db;
CREATE DATABASE IF NOT EXISTS document_db;

-- Donner tous les privilèges à root
GRANT ALL PRIVILEGES ON user_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON inscription_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON soutenance_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON notification_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON document_db.* TO 'root'@'%';

FLUSH PRIVILEGES;

-- Message de confirmation
SELECT 'Bases de données créées avec succès!' AS message;
