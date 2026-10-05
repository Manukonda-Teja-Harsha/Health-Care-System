-- ─────────────────────────────────────────────────────────────────────────────
-- HEALTHCARE SYSTEM DATABASE SCHEMA
-- Target Engine: MySQL / MariaDB (via XAMPP)
-- Database: healthcare_db
-- ─────────────────────────────────────────────────────────────────────────────

CREATE DATABASE IF NOT EXISTS `healthcare_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `healthcare_db`;

-- Drop existing tables in reverse dependency order (safe for re-runs)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `lab_reports`;
DROP TABLE IF EXISTS `medical_records`;
DROP TABLE IF EXISTS `prescription_items`;
DROP TABLE IF EXISTS `prescriptions`;
DROP TABLE IF EXISTS `appointments`;
DROP TABLE IF EXISTS `doctor_availability`;
DROP TABLE IF EXISTS `doctors`;
DROP TABLE IF EXISTS `patients`;
DROP TABLE IF EXISTS `departments`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. USERS TABLE
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('PATIENT', 'DOCTOR', 'ADMIN') NOT NULL,
  `phone` VARCHAR(30) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. DEPARTMENTS TABLE
CREATE TABLE `departments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. PATIENTS TABLE
CREATE TABLE `patients` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `date_of_birth` DATE NULL,
  `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
  `blood_group` VARCHAR(10) NULL,
  `allergies` TEXT NULL,
  `emergency_contact` VARCHAR(50) NULL,
  `address` TEXT NULL,
  `insurance_provider` VARCHAR(100) NULL,
  `insurance_number` VARCHAR(100) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_patients_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. DOCTORS TABLE
CREATE TABLE `doctors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `department_id` INT NOT NULL,
  `specialization` VARCHAR(100) NOT NULL,
  `qualification` VARCHAR(255) NULL,
  `experience_years` INT NOT NULL DEFAULT 0,
  `bio` TEXT NULL,
  `languages` VARCHAR(255) NULL,
  `consultation_fee` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `hospital` VARCHAR(150) NOT NULL DEFAULT 'City General Hospital',
  `floor` VARCHAR(50) NULL,
  `room` VARCHAR(50) NULL,
  `rating` DECIMAL(3, 2) NOT NULL DEFAULT 5.00,
  `review_count` INT NOT NULL DEFAULT 0,
  `profile_image` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_doctors_department` (`department_id`),
  INDEX `idx_doctors_specialization` (`specialization`),
  CONSTRAINT `fk_doctors_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_doctors_department` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. DOCTOR AVAILABILITY TABLE
CREATE TABLE `doctor_availability` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `doctor_id` INT NOT NULL,
  `day_of_week` ENUM('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN') NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `consultation_type` ENUM('IN_PERSON', 'VIDEO') NOT NULL DEFAULT 'IN_PERSON',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_availability_doctor` (`doctor_id`),
  CONSTRAINT `fk_availability_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. APPOINTMENTS TABLE
CREATE TABLE `appointments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `doctor_id` INT NOT NULL,
  `appointment_date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NULL,
  `appointment_type` ENUM('IN_PERSON', 'VIDEO') NOT NULL DEFAULT 'IN_PERSON',
  `status` ENUM('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
  `reason` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_appointments_patient` (`patient_id`),
  INDEX `idx_appointments_doctor` (`doctor_id`),
  INDEX `idx_appointments_date` (`appointment_date`),
  CONSTRAINT `fk_appointments_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_appointments_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. PRESCRIPTIONS TABLE
CREATE TABLE `prescriptions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `appointment_id` INT NULL,
  `patient_id` INT NOT NULL,
  `doctor_id` INT NOT NULL,
  `diagnosis` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_prescriptions_patient` (`patient_id`),
  INDEX `idx_prescriptions_doctor` (`doctor_id`),
  CONSTRAINT `fk_prescriptions_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_prescriptions_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_prescriptions_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. PRESCRIPTION ITEMS TABLE (Normalized Medicine Items)
CREATE TABLE `prescription_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `prescription_id` INT NOT NULL,
  `medication` VARCHAR(150) NOT NULL,
  `dosage` VARCHAR(100) NOT NULL,
  `frequency` VARCHAR(100) NOT NULL,
  `duration` VARCHAR(100) NOT NULL,
  `instructions` TEXT NULL,
  INDEX `idx_prescription_items_prescription` (`prescription_id`),
  CONSTRAINT `fk_items_prescription` FOREIGN KEY (`prescription_id`) REFERENCES `prescriptions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. MEDICAL RECORDS TABLE
CREATE TABLE `medical_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `doctor_id` INT NULL,
  `record_type` ENUM('DIAGNOSIS', 'CONSULTATION', 'NOTE', 'DOCUMENT') NOT NULL DEFAULT 'NOTE',
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `file_url` VARCHAR(255) NULL,
  `record_date` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_medical_records_patient` (`patient_id`),
  INDEX `idx_medical_records_doctor` (`doctor_id`),
  CONSTRAINT `fk_records_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_records_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. LAB REPORTS TABLE
CREATE TABLE `lab_reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `patient_id` INT NOT NULL,
  `doctor_id` INT NULL,
  `appointment_id` INT NULL,
  `test_name` VARCHAR(200) NOT NULL,
  `result` TEXT NULL,
  `status` ENUM('NORMAL', 'ATTENTION', 'PENDING', 'CRITICAL') NOT NULL DEFAULT 'NORMAL',
  `report_date` DATE NOT NULL,
  `notes` TEXT NULL,
  `file_url` VARCHAR(255) NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_lab_reports_patient` (`patient_id`),
  INDEX `idx_lab_reports_doctor` (`doctor_id`),
  CONSTRAINT `fk_lab_reports_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_lab_reports_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctors` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_lab_reports_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. NOTIFICATIONS TABLE
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(50) NOT NULL DEFAULT 'INFO',
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_notifications_user` (`user_id`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
