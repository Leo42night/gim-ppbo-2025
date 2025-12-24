-- Dumping database structure for kelas_pbo
DROP DATABASE IF EXISTS `kelas_pbo`;
CREATE DATABASE IF NOT EXISTS `kelas_pbo`;
USE `kelas_pbo`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `picture` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB;

-- Dumping structure for table kelas_pbo.projects
CREATE TABLE IF NOT EXISTS `projects` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(150) NOT NULL,
  `description` text,
  `image` varchar(255) DEFAULT NULL,
  `link_web` varchar(255) DEFAULT NULL,
  `link_vid_pitch` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `link_vid_demo` varchar(255) DEFAULT NULL,
  `link_repo` varchar(50) DEFAULT NULL,
  `link_doc` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping structure for table kelas_pbo.ratings
CREATE TABLE IF NOT EXISTS `ratings` (
  `user_id` bigint unsigned NOT NULL,
  `project_id` bigint unsigned NOT NULL,
  `rate` tinyint unsigned NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`,`project_id`),
  KEY `fk_ratings_project` (`project_id`),
  CONSTRAINT `fk_ratings_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ratings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `ratings_chk_1` CHECK ((`rate` between 1 and 5))
) ENGINE=InnoDB;

-- Dumping structure for table kelas_pbo.teams
CREATE TABLE IF NOT EXISTS `teams` (
  `project_id` bigint unsigned NOT NULL,
  `user_id` bigint unsigned NOT NULL,
  `role` varchar(50) DEFAULT 'member',
  PRIMARY KEY (`project_id`,`user_id`),
  KEY `fk_teams_user` (`user_id`),
  CONSTRAINT `fk_teams_project` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_teams_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;



