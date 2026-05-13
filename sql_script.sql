-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: invoice_app
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `activity_logs`
--

DROP TABLE IF EXISTS `activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `activity_logs` (
  `id` char(36) NOT NULL,
  `userId` char(36) NOT NULL,
  `action` varchar(50) NOT NULL,
  `entityType` varchar(50) NOT NULL,
  `entityId` char(36) NOT NULL,
  `entityName` varchar(255) DEFAULT NULL,
  `description` text,
  `changes` json DEFAULT NULL,
  `ipAddress` varchar(45) DEFAULT NULL,
  `userAgent` text,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_userId` (`userId`),
  KEY `idx_action` (`action`),
  KEY `idx_entityType` (`entityType`),
  KEY `idx_createdAt` (`createdAt`),
  CONSTRAINT `fk_activity_logs_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `activity_logs`
--

LOCK TABLES `activity_logs` WRITE;
/*!40000 ALTER TABLE `activity_logs` DISABLE KEYS */;
/*!40000 ALTER TABLE `activity_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `client_summary`
--

DROP TABLE IF EXISTS `client_summary`;
/*!50001 DROP VIEW IF EXISTS `client_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `client_summary` AS SELECT 
 1 AS `id`,
 1 AS `userId`,
 1 AS `name`,
 1 AS `email`,
 1 AS `company`,
 1 AS `totalInvoiced`,
 1 AS `totalPaid`,
 1 AS `outstandingAmount`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `id` char(36) NOT NULL,
  `userId` char(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `company` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `zipCode` varchar(20) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `taxId` varchar(100) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `notes` text,
  `isActive` tinyint(1) DEFAULT '1',
  `totalInvoiced` decimal(12,2) DEFAULT '0.00',
  `totalPaid` decimal(12,2) DEFAULT '0.00',
  `lastInvoiceDate` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_email_userId` (`email`,`userId`),
  KEY `idx_userId` (`userId`),
  KEY `idx_isActive` (`isActive`),
  KEY `idx_createdAt` (`createdAt`),
  CONSTRAINT `fk_clients_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice_items`
--

DROP TABLE IF EXISTS `invoice_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice_items` (
  `id` char(36) NOT NULL,
  `invoiceId` char(36) NOT NULL,
  `description` text NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_invoiceId` (`invoiceId`),
  CONSTRAINT `fk_invoice_items_invoiceId` FOREIGN KEY (`invoiceId`) REFERENCES `invoices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice_items`
--

LOCK TABLES `invoice_items` WRITE;
/*!40000 ALTER TABLE `invoice_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoice_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `invoice_summary`
--

DROP TABLE IF EXISTS `invoice_summary`;
/*!50001 DROP VIEW IF EXISTS `invoice_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `invoice_summary` AS SELECT 
 1 AS `id`,
 1 AS `userId`,
 1 AS `clientId`,
 1 AS `invoiceNumber`,
 1 AS `status`,
 1 AS `total`,
 1 AS `paidAmount`,
 1 AS `outstandingAmount`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoices` (
  `id` char(36) NOT NULL,
  `userId` char(36) NOT NULL,
  `clientId` char(36) NOT NULL,
  `invoiceNumber` varchar(50) NOT NULL,
  `status` enum('draft','sent','viewed','paid','partial','overdue','cancelled') DEFAULT 'draft',
  `issueDate` datetime NOT NULL,
  `dueDate` datetime NOT NULL,
  `subtotal` decimal(12,2) DEFAULT '0.00',
  `taxRate` decimal(5,2) DEFAULT '0.00',
  `taxAmount` decimal(12,2) DEFAULT '0.00',
  `total` decimal(12,2) NOT NULL,
  `paidAmount` decimal(12,2) DEFAULT '0.00',
  `discount` decimal(12,2) DEFAULT '0.00',
  `currency` enum('USD','EUR','GBP','CAD','AUD') DEFAULT 'USD',
  `notes` text,
  `terms` text,
  `sentAt` datetime DEFAULT NULL,
  `viewedAt` datetime DEFAULT NULL,
  `reminderSentAt` datetime DEFAULT NULL,
  `lastReminderSentAt` datetime DEFAULT NULL,
  `attachments` json DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_invoiceNumber` (`invoiceNumber`),
  KEY `idx_userId` (`userId`),
  KEY `idx_clientId` (`clientId`),
  KEY `idx_status` (`status`),
  KEY `idx_issueDate` (`issueDate`),
  KEY `idx_dueDate` (`dueDate`),
  CONSTRAINT `fk_invoices_clientId` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_invoices_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoices`
--

LOCK TABLES `invoices` WRITE;
/*!40000 ALTER TABLE `invoices` DISABLE KEYS */;
/*!40000 ALTER TABLE `invoices` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` char(36) NOT NULL,
  `userId` char(36) NOT NULL,
  `invoiceId` char(36) NOT NULL,
  `clientId` char(36) NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `paymentMethod` enum('cash','check','bank_transfer','credit_card','paypal','other') NOT NULL,
  `reference` varchar(255) DEFAULT NULL,
  `status` enum('pending','completed','failed','refunded') DEFAULT 'completed',
  `paymentDate` datetime NOT NULL,
  `notes` text,
  `receiptUrl` longtext,
  `transactionId` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_userId` (`userId`),
  KEY `idx_invoiceId` (`invoiceId`),
  KEY `idx_clientId` (`clientId`),
  KEY `idx_status` (`status`),
  KEY `idx_paymentDate` (`paymentDate`),
  CONSTRAINT `fk_payments_clientId` FOREIGN KEY (`clientId`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payments_invoiceId` FOREIGN KEY (`invoiceId`) REFERENCES `invoices` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payments_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` char(36) NOT NULL,
  `googleId` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `nickname` varchar(255) DEFAULT NULL,
  `givenName` varchar(255) DEFAULT NULL,
  `familyName` varchar(255) DEFAULT NULL,
  `avatar` longtext,
  `avatarSource` enum('google','upload') DEFAULT 'google',
  `passwordHash` varchar(255) DEFAULT NULL,
  `provider` enum('google','email') DEFAULT 'google',
  `providerData` json DEFAULT NULL,
  `roles` json DEFAULT (_utf8mb4'["user"]'),
  `stripeAccountId` varchar(255) DEFAULT NULL,
  `businessName` varchar(255) DEFAULT NULL,
  `companyLogo` longtext,
  `phoneNumber` varchar(20) DEFAULT NULL,
  `address` text,
  `isEmailVerified` tinyint(1) DEFAULT '0',
  `isActive` tinyint(1) DEFAULT '1',
  `refreshToken` varchar(500) DEFAULT NULL,
  `lastLoginAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `googleId` (`googleId`),
  KEY `idx_googleId` (`googleId`),
  KEY `idx_email` (`email`),
  KEY `idx_isActive` (`isActive`),
  KEY `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `client_summary`
--

/*!50001 DROP VIEW IF EXISTS `client_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `client_summary` AS select `clients`.`id` AS `id`,`clients`.`userId` AS `userId`,`clients`.`name` AS `name`,`clients`.`email` AS `email`,`clients`.`company` AS `company`,`clients`.`totalInvoiced` AS `totalInvoiced`,`clients`.`totalPaid` AS `totalPaid`,(`clients`.`totalInvoiced` - `clients`.`totalPaid`) AS `outstandingAmount` from `clients` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `invoice_summary`
--

/*!50001 DROP VIEW IF EXISTS `invoice_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `invoice_summary` AS select `invoices`.`id` AS `id`,`invoices`.`userId` AS `userId`,`invoices`.`clientId` AS `clientId`,`invoices`.`invoiceNumber` AS `invoiceNumber`,`invoices`.`status` AS `status`,`invoices`.`total` AS `total`,`invoices`.`paidAmount` AS `paidAmount`,(`invoices`.`total` - `invoices`.`paidAmount`) AS `outstandingAmount` from `invoices` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-13 23:34:49
