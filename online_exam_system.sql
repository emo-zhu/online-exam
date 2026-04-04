/*
 Navicat Premium Dump SQL

 Source Server         : demo
 Source Server Type    : MySQL
 Source Server Version : 90600 (9.6.0)
 Source Host           : localhost:3306
 Source Schema         : online_exam_system

 Target Server Type    : MySQL
 Target Server Version : 90600 (9.6.0)
 File Encoding         : 65001

 Date: 04/04/2026 18:10:26
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for _prisma_migrations
-- ----------------------------
DROP TABLE IF EXISTS `_prisma_migrations`;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of _prisma_migrations
-- ----------------------------
BEGIN;
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES ('6dfd6792-032d-489f-a7a7-9df604edb178', '70bd3125e0d4035cb5dc9353c933706996a694bdec5c4e0b129c08d6564e2d48', '2026-03-27 07:29:20.369', '20260327071500_sync_existing_schema_and_rich_content', '', NULL, '2026-03-27 07:29:20.369', 0);
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES ('b1fae69a-1d05-432a-9298-c8caed465525', 'd06b345b262d316812911b3809bfd809d6f68bfeb7bf5a9f952765b6739c64a8', '2026-03-27 07:21:23.490', '20260324132952_init', '', NULL, '2026-03-27 07:21:23.490', 0);
COMMIT;

-- ----------------------------
-- Table structure for auth_refresh_token
-- ----------------------------
DROP TABLE IF EXISTS `auth_refresh_token`;
CREATE TABLE `auth_refresh_token` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `token` varchar(512) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` datetime(3) NOT NULL,
  `revoked_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_refresh_token_token_key` (`token`),
  KEY `idx_refresh_user_id` (`user_id`),
  CONSTRAINT `auth_refresh_token_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=91 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of auth_refresh_token
-- ----------------------------
BEGIN;
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (1, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDM2NDg2OSwiZXhwIjoxNzc0OTY5NjY5fQ.KN4GDHsZwrFRSQTI4GFshHVog7jC6dJaR2bLUyV8GlI', '2026-03-31 15:07:49.000', '2026-03-24 15:10:28.417', '2026-03-24 15:07:49.580', '2026-03-24 15:10:28.418');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (2, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDM2NTA0OSwiZXhwIjoxNzc0OTY5ODQ5fQ.KQYku7tMniPyMLrxln5S7NgNPjSaeEdDrVLDZHgNAts', '2026-03-31 15:10:49.000', '2026-03-24 15:11:11.705', '2026-03-24 15:10:49.112', '2026-03-24 15:11:11.706');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (3, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDM2NTEwNywiZXhwIjoxNzc0OTY5OTA3fQ.EnKTITQb3JbqYlvuINzXnmh1Rac4us7pILjqJhTcn9Y', '2026-03-31 15:11:47.000', '2026-03-24 15:23:33.094', '2026-03-24 15:11:47.420', '2026-03-24 15:23:33.095');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (4, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDM2NTQ5OSwiZXhwIjoxNzc0OTcwMjk5fQ.U1c3JH54X51o4OugysXDEiUcpbvIWoG_Uolh1x9Naoc', '2026-03-31 15:18:19.000', NULL, '2026-03-24 15:18:19.309', '2026-03-24 15:18:19.309');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (5, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDM2NTgzMSwiZXhwIjoxNzc0OTcwNjMxfQ.rWER_z09qetyyHoYtzuey21tGFps4HZa3v7YMQCA1NA', '2026-03-31 15:23:51.000', NULL, '2026-03-24 15:23:51.079', '2026-03-24 15:23:51.079');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (6, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDM3Mzg1MSwiZXhwIjoxNzc0OTc4NjUxfQ.cSJVOA5r9CZ1nIcF-9GLovKzuqDcSfH3p1Sk9dqnGMQ', '2026-03-31 17:37:31.000', '2026-03-24 17:38:39.372', '2026-03-24 17:37:31.815', '2026-03-24 17:38:39.372');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (7, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDM3MzkyOCwiZXhwIjoxNzc0OTc4NzI4fQ.GDiTl2ryOZ_DzrLQoM7I7x3XgtYf7K9s461d0LDTxhY', '2026-03-31 17:38:48.000', '2026-03-24 17:58:25.687', '2026-03-24 17:38:48.609', '2026-03-24 17:58:25.687');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (8, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDM3NTE1NSwiZXhwIjoxNzc0OTc5OTU1fQ.qd1rbVdmiDqhvAgQnDifwwDFwaoG0dLmlSl46mqUZgg', '2026-03-31 17:59:15.000', '2026-03-24 17:59:31.146', '2026-03-24 17:59:15.576', '2026-03-24 17:59:31.147');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (9, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDM3NTI2NywiZXhwIjoxNzc0OTgwMDY3fQ.LdRSgpIrOOolXxk7TLriQayRy2hNqSccyiV-XetNkqs', '2026-03-31 18:01:07.000', '2026-03-24 18:20:29.948', '2026-03-24 18:01:07.751', '2026-03-24 18:20:29.949');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (10, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDM3NjQ1OSwiZXhwIjoxNzc0OTgxMjU5fQ.v1fzK6ySUjlqetbSJA-zCTD5Xb5lW1vB4a851NHe6DY', '2026-03-31 18:20:59.000', '2026-03-24 18:21:05.508', '2026-03-24 18:20:59.532', '2026-03-24 18:21:05.509');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (11, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDM3NjQ5MCwiZXhwIjoxNzc0OTgxMjkwfQ.IpA2CbNRcyoQLO5fufihSrcvWSUfNJg0q2phCq2TFX8', '2026-03-31 18:21:30.000', '2026-03-24 18:21:55.296', '2026-03-24 18:21:30.251', '2026-03-24 18:21:55.297');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (12, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDM3NjgwOSwiZXhwIjoxNzc0OTgxNjA5fQ.zXP-vP0chDCgLTfNRMgLJvIHnu7Bf5RJJexdNM8yYaM', '2026-03-31 18:26:49.000', '2026-03-24 18:26:57.103', '2026-03-24 18:26:49.578', '2026-03-24 18:26:57.103');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (13, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDM3NjgyNCwiZXhwIjoxNzc0OTgxNjI0fQ.yzNJ8Mucp21WolaTkltLGAMLq8nqWROYEt3CYLr8m0U', '2026-03-31 18:27:04.000', '2026-03-24 18:28:32.712', '2026-03-24 18:27:04.199', '2026-03-24 18:28:32.713');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (14, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDM3OTg2NiwiZXhwIjoxNzc0OTg0NjY2fQ.jm7nRy2U4_mfSovslwc4Dw9d8BpF1iLeF0XmCKFq52w', '2026-03-31 19:17:46.000', '2026-03-24 19:17:58.792', '2026-03-24 19:17:46.937', '2026-03-24 19:17:58.793');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (15, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDM3OTg4MywiZXhwIjoxNzc0OTg0NjgzfQ.acCwtilMexrpeA-0C15iEYxrrBjQtzJke6Y_mnzFVoI', '2026-03-31 19:18:03.000', NULL, '2026-03-24 19:18:03.534', '2026-03-24 19:18:03.534');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (16, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDQwMDI5OSwiZXhwIjoxNzc1MDA1MDk5fQ.IZ22ct-_iWtRCm2P32trG1cag0B0nM92Rrau-UpcQK8', '2026-04-01 00:58:19.000', NULL, '2026-03-25 00:58:19.592', '2026-03-25 00:58:19.592');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (17, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDQwMDYxNywiZXhwIjoxNzc1MDA1NDE3fQ.KpCTNLwQUFgf1XR4ufV7biNaBh8ViPcIp-tr-q0ilf0', '2026-04-01 01:03:37.000', NULL, '2026-03-25 01:03:37.264', '2026-03-25 01:03:37.264');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (18, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDQwMDc4OCwiZXhwIjoxNzc1MDA1NTg4fQ.Nc21RP89W80XDnxZ-DTVYtSAVXldMRj6XsiaeuPkVEo', '2026-04-01 01:06:28.000', NULL, '2026-03-25 01:06:28.386', '2026-03-25 01:06:28.386');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (19, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDQwMDg5MywiZXhwIjoxNzc1MDA1NjkzfQ.cwSdQOgc3Zwvbj1tWv7Aci38sHKfbV0VE5wlAqoWjAg', '2026-04-01 01:08:13.000', NULL, '2026-03-25 01:08:13.141', '2026-03-25 01:08:13.141');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (20, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDQwMDk3MSwiZXhwIjoxNzc1MDA1NzcxfQ.zpRH1lSHwMcbwJHW8dWSfHUW0_DFMTNvNNCtTANt0rI', '2026-04-01 01:09:31.000', NULL, '2026-03-25 01:09:31.539', '2026-03-25 01:09:31.539');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (21, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDQwMzc3MSwiZXhwIjoxNzc1MDA4NTcxfQ.cbb8gmIc6PK7o7FmiPUeJi2ggYFdVU-gPMZtSwwfZqY', '2026-04-01 01:56:11.000', NULL, '2026-03-25 01:56:11.723', '2026-03-25 01:56:11.723');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (34, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDQwNzg5NSwiZXhwIjoxNzc1MDEyNjk1fQ.Lml1wuMyTxidOY2LdIjSQrg8dQYP6I1wVKsBgGFc-K0', '2026-04-01 03:04:55.000', NULL, '2026-03-25 03:04:55.430', '2026-03-25 03:04:55.430');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (36, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDQwOTIzOCwiZXhwIjoxNzc1MDE0MDM4fQ.EZyILSNudBwxTnyX1d2mb-cFHHNnHcji2nJxmbL9w2I', '2026-04-01 03:27:18.000', '2026-03-25 03:27:27.413', '2026-03-25 03:27:18.605', '2026-03-25 03:27:27.414');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (37, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDQwOTI1NCwiZXhwIjoxNzc1MDE0MDU0fQ.3_DejFMRGRCZuuWIfgzFNebthyDUieHnwjE5dsGAt4I', '2026-04-01 03:27:34.000', NULL, '2026-03-25 03:27:34.835', '2026-03-25 03:27:34.835');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (38, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDQ0OTY0NiwiZXhwIjoxNzc1MDU0NDQ2fQ.fPym_5Rt27bWyzgvoRjmixkGatP5sUzTiLiK6Bf53zg', '2026-04-01 14:40:46.000', '2026-03-25 17:25:14.551', '2026-03-25 14:40:46.879', '2026-03-25 17:25:14.552');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (39, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDQ1NzAzNCwiZXhwIjoxNzc1MDYxODM0fQ.uhycuEbwGK2ReXmwaRJekoO4Q5MxPZ562_enbMGXHLs', '2026-04-01 16:43:54.000', NULL, '2026-03-25 16:43:54.505', '2026-03-25 16:43:54.505');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (40, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDQ1NzIwOCwiZXhwIjoxNzc1MDYyMDA4fQ.SPRMiRpNb6wDwmfcyOEGsMgqwQvxHi4cPxm2uwzuixY', '2026-04-01 16:46:48.000', NULL, '2026-03-25 16:46:48.114', '2026-03-25 16:46:48.114');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (41, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDQ1NzQ0NiwiZXhwIjoxNzc1MDYyMjQ2fQ.jm7PoEbDEIOhui3C2JAPSbkPIRuDUqxY0v8yOTurddE', '2026-04-01 16:50:46.000', NULL, '2026-03-25 16:50:46.009', '2026-03-25 16:50:46.009');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (42, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDQ1Nzk2MCwiZXhwIjoxNzc1MDYyNzYwfQ.bNS4sHhzw5si8JS9vQWL2clOYylfKlIXxB9_aaWdbU4', '2026-04-01 16:59:20.000', '2026-03-25 16:59:20.621', '2026-03-25 16:59:20.511', '2026-03-25 16:59:20.622');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (43, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDQ1ODQ4NiwiZXhwIjoxNzc1MDYzMjg2fQ.n6cb4jlH8TTM8khbVarMcu3Z5sVMtwsgVbKeOktvKBc', '2026-04-01 17:08:06.000', NULL, '2026-03-25 17:08:06.110', '2026-03-25 17:08:06.110');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (44, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDQ1ODk3OSwiZXhwIjoxNzc1MDYzNzc5fQ.5WBuOUhHLDO1dmNDKFhrdequAMLSo0bog2s6PMEEDRw', '2026-04-01 17:16:19.000', NULL, '2026-03-25 17:16:19.212', '2026-03-25 17:16:19.212');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (45, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDQ1OTM3MywiZXhwIjoxNzc1MDY0MTczfQ.QPZrcZ03PNg7-ppK5tj-O2-Gjc2oUe6soFpDwC3aBXc', '2026-04-01 17:22:53.000', NULL, '2026-03-25 17:22:53.280', '2026-03-25 17:22:53.280');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (46, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDQ1OTUxNywiZXhwIjoxNzc1MDY0MzE3fQ.JlAE9dOQo1RlcpaTan8eqKkD-0O19ODk8GDF41prxIg', '2026-04-01 17:25:17.000', '2026-03-25 17:25:19.175', '2026-03-25 17:25:17.415', '2026-03-25 17:25:19.176');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (47, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDQ1OTUyOSwiZXhwIjoxNzc1MDY0MzI5fQ.j8UpdBn1B7I64ukMi4WfYHEnsa4_YJKOimKAW7bEthA', '2026-04-01 17:25:29.000', '2026-03-25 17:25:32.650', '2026-03-25 17:25:29.884', '2026-03-25 17:25:32.651');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (50, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDQ1OTU5MywiZXhwIjoxNzc1MDY0MzkzfQ.zcjqDP_5_g8lLkf-Zmig_DINgm__13t_1lZBlQHyQd0', '2026-04-01 17:26:33.000', '2026-03-26 12:40:14.979', '2026-03-25 17:26:33.941', '2026-03-26 12:40:14.979');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (51, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDQ2MjQ3NCwiZXhwIjoxNzc1MDY3Mjc0fQ.Mqs1qsL7cH9qGDVMEexI9ECsJFM1s05KiYUA1Opxnsg', '2026-04-01 18:14:34.000', NULL, '2026-03-25 18:14:34.841', '2026-03-25 18:14:34.841');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (52, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDUyOTg3MCwiZXhwIjoxNzc1MTM0NjcwfQ.bNR5ux7dg__G1fnoMdwE_WxPhjnrp65dAkqR2dcPZFI', '2026-04-02 12:57:50.000', '2026-03-26 12:58:33.995', '2026-03-26 12:57:50.868', '2026-03-26 12:58:33.996');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (53, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDUzMDU5OSwiZXhwIjoxNzc1MTM1Mzk5fQ.8ssimDUaIffAl2y31GVjeLQHkBLvQzMQLm06ans5b0c', '2026-04-02 13:09:59.000', '2026-03-26 13:10:54.898', '2026-03-26 13:09:59.169', '2026-03-26 13:10:54.898');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (55, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDUzMDgyNiwiZXhwIjoxNzc1MTM1NjI2fQ.e1ZcwXfazg_YTi63xwQmtaLcFACfxDWhUTssx6971tc', '2026-04-02 13:13:46.000', '2026-03-26 18:19:34.731', '2026-03-26 13:13:46.757', '2026-03-26 18:19:34.731');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (56, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDUzNTk2MiwiZXhwIjoxNzc1MTQwNzYyfQ.0rvPJv2zh3hzwpoUwDEIlSUPYVgRm1HdWH8bh_QCIN0', '2026-04-02 14:39:22.000', NULL, '2026-03-26 14:39:22.883', '2026-03-26 14:39:22.883');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (57, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyIiwidXNlcm5hbWUiOiJ0ZWFjaGVyIiwiaWF0IjoxNzc0NTQ0OTEyLCJleHAiOjE3NzUxNDk3MTJ9._3JsjFGdGaQD01re-zyHwjOrpgsoyNjOAxrz4vvHmQM', '2026-04-02 17:08:32.000', NULL, '2026-03-26 17:08:32.831', '2026-03-26 17:08:32.831');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (58, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyIiwidXNlcm5hbWUiOiJ0ZWFjaGVyIiwiaWF0IjoxNzc0NTQ1MzM2LCJleHAiOjE3NzUxNTAxMzZ9.ypHXf-oh9ASdfBBYKAVpYutHTpQl8OwEeY7YoCMOO3E', '2026-04-02 17:15:36.000', NULL, '2026-03-26 17:15:36.007', '2026-03-26 17:15:36.007');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (59, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyIiwidXNlcm5hbWUiOiJ0ZWFjaGVyIiwiaWF0IjoxNzc0NTQ1NTg0LCJleHAiOjE3NzUxNTAzODR9.pXbnDg5Zr5TV7fQGHoahPQn622YUZa7nWQUCF8uaRVE', '2026-04-02 17:19:44.000', NULL, '2026-03-26 17:19:44.686', '2026-03-26 17:19:44.686');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (60, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyIiwidXNlcm5hbWUiOiJ0ZWFjaGVyIiwiaWF0IjoxNzc0NTQ3MTAwLCJleHAiOjE3NzUxNTE5MDB9.7q3YkDI5bODsH4kRakf43iedHvHi53haUJzynIZDT-k', '2026-04-02 17:45:00.000', NULL, '2026-03-26 17:45:00.199', '2026-03-26 17:45:00.199');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (61, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyIiwidXNlcm5hbWUiOiJ0ZWFjaGVyIiwiaWF0IjoxNzc0NTQ3MTUwLCJleHAiOjE3NzUxNTE5NTB9.mrpRDYtpJcyOOP_bD95DnCx0v1wveasU0OVViZgfHAw', '2026-04-02 17:45:50.000', NULL, '2026-03-26 17:45:50.102', '2026-03-26 17:45:50.102');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (62, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyIiwidXNlcm5hbWUiOiJ0ZWFjaGVyIiwiaWF0IjoxNzc0NTQ3MTg1LCJleHAiOjE3NzUxNTE5ODV9.GsR9OjN4IkOeuLscrDs0gBDOgWMQRkwGvcMB-wv8K-8', '2026-04-02 17:46:25.000', NULL, '2026-03-26 17:46:25.758', '2026-03-26 17:46:25.758');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (63, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyIiwidXNlcm5hbWUiOiJ0ZWFjaGVyIiwiaWF0IjoxNzc0NTQ3MjU0LCJleHAiOjE3NzUxNTIwNTR9.3H0oKDi__RtGlb06IOcYkO4C7_PGFYB0z8XqxnGVfMQ', '2026-04-02 17:47:34.000', NULL, '2026-03-26 17:47:34.257', '2026-03-26 17:47:34.257');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (64, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDU0OTIwNywiZXhwIjoxNzc1MTU0MDA3fQ.pZRL9jXoqN09UetC-fL6R5CTthTDUtmLsmUBGNHSDH0', '2026-04-02 18:20:07.000', '2026-03-26 18:23:27.631', '2026-03-26 18:20:07.591', '2026-03-26 18:23:27.631');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (65, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMSIsInVzZXJuYW1lIjoic3R1ZGVudCIsImlhdCI6MTc3NDU0OTQyNSwiZXhwIjoxNzc1MTU0MjI1fQ.2OYdrw6mTQmr4MUGGaKVJfDWtFiDxwcI8KZi9m4Wi68', '2026-04-02 18:23:45.000', '2026-03-26 18:24:35.329', '2026-03-26 18:23:45.219', '2026-03-26 18:24:35.329');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (66, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyIiwidXNlcm5hbWUiOiJ0ZWFjaGVyIiwiaWF0IjoxNzc0NTQ5NTE4LCJleHAiOjE3NzUxNTQzMTh9.ktJKLuOoBB_LDPO5IL4L0tnmv0Yo8HtitSyMYOIqAl8', '2026-04-02 18:25:18.000', '2026-03-26 18:26:37.537', '2026-03-26 18:25:18.017', '2026-03-26 18:26:37.538');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (67, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMSIsInVzZXJuYW1lIjoic3R1ZGVudCIsImlhdCI6MTc3NDU0OTYwOSwiZXhwIjoxNzc1MTU0NDA5fQ.oM3d7_ft3jHPiWJ92-zt5ajz54fxnBXtUWCXuh8uct4', '2026-04-02 18:26:49.000', '2026-03-26 18:28:00.361', '2026-03-26 18:26:49.089', '2026-03-26 18:28:00.362');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (68, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDU0OTY5MywiZXhwIjoxNzc1MTU0NDkzfQ.Asps11dEmxnA9W_RN8-ZBXhApO-K9gpFG8UrWSIgLUk', '2026-04-02 18:28:13.000', '2026-03-26 18:30:26.036', '2026-03-26 18:28:13.268', '2026-03-26 18:30:26.037');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (69, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMSIsInVzZXJuYW1lIjoic3R1ZGVudCIsImlhdCI6MTc3NDU0OTgzNSwiZXhwIjoxNzc1MTU0NjM1fQ.jD-KbKmWKlUnthKjh_JQjIievbG-sXBKwyU-gglCXWg', '2026-04-02 18:30:35.000', '2026-03-27 04:59:12.207', '2026-03-26 18:30:35.022', '2026-03-27 04:59:12.208');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (70, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMSIsInVzZXJuYW1lIjoic3R1ZGVudCIsImlhdCI6MTc3NDU4NzAzMywiZXhwIjoxNzc1MTkxODMzfQ.GCoKyZEcMdViqsZz34t8EN02-jCMx7GradrAx07GfMU', '2026-04-03 04:50:33.000', NULL, '2026-03-27 04:50:33.688', '2026-03-27 04:50:33.688');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (71, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyIiwidXNlcm5hbWUiOiJ0ZWFjaGVyIiwiaWF0IjoxNzc0NTg3MDMzLCJleHAiOjE3NzUxOTE4MzN9.tFzF-sI73Z8kRiwAQTg3XAVWniuBlwHHZcwE0EKYosM', '2026-04-03 04:50:33.000', NULL, '2026-03-27 04:50:33.767', '2026-03-27 04:50:33.767');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (72, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMSIsInVzZXJuYW1lIjoic3R1ZGVudCIsImlhdCI6MTc3NDU4NzA1NiwiZXhwIjoxNzc1MTkxODU2fQ.p7xhDN_ump4-Xdh3JKT5WdG4HsdAZSpvXxH7PB05NC0', '2026-04-03 04:50:56.000', NULL, '2026-03-27 04:50:56.438', '2026-03-27 04:50:56.438');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (76, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMSIsInVzZXJuYW1lIjoic3R1ZGVudCIsImlhdCI6MTc3NDU4NzYyOSwiZXhwIjoxNzc1MTkyNDI5fQ.dqC6meoRQC7CGb1xTLJ12hoBTIWuF5IVKz4-g_F8sR4', '2026-04-03 05:00:29.000', '2026-03-27 05:00:46.650', '2026-03-27 05:00:29.994', '2026-03-27 05:00:46.650');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (77, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDU4NzY4NywiZXhwIjoxNzc1MTkyNDg3fQ.c7VKdaK0O7gN0t5LzhQ4gMzf-CQKTkvk1v7YENXyzvM', '2026-04-03 05:01:27.000', '2026-03-27 07:38:47.164', '2026-03-27 05:01:27.944', '2026-03-27 07:38:47.164');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (78, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyIiwidXNlcm5hbWUiOiJ0ZWFjaGVyIiwiaWF0IjoxNzc0NTk4ODY0LCJleHAiOjE3NzUyMDM2NjR9.XtyA0fxj6vazZDoQbeGHrHI8UCtCCfE2sPtB2U5l4IE', '2026-04-03 08:07:44.000', NULL, '2026-03-27 08:07:44.917', '2026-03-27 08:07:44.917');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (79, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMSIsInVzZXJuYW1lIjoic3R1ZGVudCIsImlhdCI6MTc3NDU5ODg2NCwiZXhwIjoxNzc1MjAzNjY0fQ.MCG_KkIxX4pRYkWSEzU6b1tC9_sPyTDrhloI-BsDowg', '2026-04-03 08:07:44.000', NULL, '2026-03-27 08:07:44.998', '2026-03-27 08:07:44.998');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (80, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMSIsInVzZXJuYW1lIjoic3R1ZGVudCIsImlhdCI6MTc3NDU5ODkxMSwiZXhwIjoxNzc1MjAzNzExfQ.uo6Cs3MDPaGRgqzRck1Z7Qph_8WhnlizwU2aU9it9QU', '2026-04-03 08:08:31.000', NULL, '2026-03-27 08:08:31.198', '2026-03-27 08:08:31.198');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (81, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyIiwidXNlcm5hbWUiOiJ0ZWFjaGVyIiwiaWF0IjoxNzc0NTk4OTM4LCJleHAiOjE3NzUyMDM3Mzh9.waQy63IRovi5zkswE_4dn5N-zsptE1IhzQWXV4uJ494', '2026-04-03 08:08:58.000', NULL, '2026-03-27 08:08:58.219', '2026-03-27 08:08:58.219');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (82, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDU5OTI2NCwiZXhwIjoxNzc1MjA0MDY0fQ.XEv4jnb9Yzgt_ZcsNycLtnGw66oYDwSymixdzc5zMSE', '2026-04-03 08:14:24.000', '2026-03-27 08:29:20.295', '2026-03-27 08:14:24.894', '2026-03-27 08:29:20.295');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (83, 4, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0IiwidXNlcm5hbWUiOiLmnLHlk4jlk4giLCJpYXQiOjE3NzQ2MDAxOTMsImV4cCI6MTc3NTIwNDk5M30.tVxwetE0brs2tjVjm4--9yEW_a34g_bcbR5g1wmItsY', '2026-04-03 08:29:53.000', '2026-03-27 09:06:29.549', '2026-03-27 08:29:53.047', '2026-03-27 09:06:29.550');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (84, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDYwMjQwMywiZXhwIjoxNzc1MjA3MjAzfQ.kF0RkaqCEfChuqxdMiJntdSjaox5PuxoHGmRvefiMO8', '2026-04-03 09:06:43.000', NULL, '2026-03-27 09:06:43.999', '2026-03-27 09:06:43.999');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (85, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDYwMjkzNSwiZXhwIjoxNzc1MjA3NzM1fQ.9fG9Q226mWVc74hvjrmAybEl1mlrsECFN_KRw46DMRQ', '2026-04-03 09:15:35.000', '2026-03-29 10:43:54.871', '2026-03-27 09:15:35.503', '2026-03-29 10:43:54.872');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (86, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyIiwidXNlcm5hbWUiOiJ0ZWFjaGVyIiwiaWF0IjoxNzc0NzgxMDYxLCJleHAiOjE3NzUzODU4NjF9.GSsGqUDOyndyG4oSfOLw2HaM2fWtWhzGsTpEjOdOXu8', '2026-04-05 10:44:21.000', NULL, '2026-03-29 10:44:21.654', '2026-03-29 10:44:21.654');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (87, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyIiwidXNlcm5hbWUiOiJ0ZWFjaGVyIiwiaWF0IjoxNzc0NzkyODM3LCJleHAiOjE3NzUzOTc2Mzd9.-meZSviEUjeTjn88TMdSsqyeS0PqbPpBEFNACS6Crd4', '2026-04-05 14:00:37.000', NULL, '2026-03-29 14:00:37.477', '2026-03-29 14:00:37.477');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (88, 2, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIyIiwidXNlcm5hbWUiOiJ0ZWFjaGVyIiwiaWF0IjoxNzc0NzkyODc4LCJleHAiOjE3NzUzOTc2Nzh9.WniDyRMBLjfRBBJcAjoaay4uLe0zKCxeUZO96REQreI', '2026-04-05 14:01:18.000', NULL, '2026-03-29 14:01:18.879', '2026-03-29 14:01:18.879');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (89, 11, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMSIsInVzZXJuYW1lIjoic3R1ZGVudCIsImlhdCI6MTc3NDc5Mjg3OSwiZXhwIjoxNzc1Mzk3Njc5fQ.bBCpUTRo6YOy1z8t46FIZaV4a1i-kDKZJgVXxdwGy3I', '2026-04-05 14:01:19.000', NULL, '2026-03-29 14:01:19.278', '2026-03-29 14:01:19.278');
INSERT INTO `auth_refresh_token` (`id`, `user_id`, `token`, `expires_at`, `revoked_at`, `created_at`, `updated_at`) VALUES (90, 1, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxIiwidXNlcm5hbWUiOiJhZG1pbiIsImlhdCI6MTc3NDk1MDY3MSwiZXhwIjoxNzc1NTU1NDcxfQ.EH5t5INXFRGnBq2IPPjZXHh6d6ikatdmUll6Nota_c8', '2026-04-07 09:51:11.000', NULL, '2026-03-31 09:51:11.397', '2026-03-31 09:51:11.397');
COMMIT;

-- ----------------------------
-- Table structure for edu_class
-- ----------------------------
DROP TABLE IF EXISTS `edu_class`;
CREATE TABLE `edu_class` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `class_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `class_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `creator_id` bigint NOT NULL,
  `student_count` int NOT NULL DEFAULT '0',
  `status` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `edu_class_class_name_key` (`class_name`),
  UNIQUE KEY `edu_class_class_code_key` (`class_code`),
  KEY `edu_class_creator_id_fkey` (`creator_id`),
  CONSTRAINT `edu_class_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `sys_user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of edu_class
-- ----------------------------
BEGIN;
INSERT INTO `edu_class` (`id`, `class_name`, `class_code`, `creator_id`, `student_count`, `status`, `created_at`, `updated_at`) VALUES (3, '计科2024-3（专升本）', 'RjDBM6Gxfv2RUa4Tbd', 1, 2, 1, '2026-03-24 18:05:38.924', '2026-03-27 08:15:40.293');
INSERT INTO `edu_class` (`id`, `class_name`, `class_code`, `creator_id`, `student_count`, `status`, `created_at`, `updated_at`) VALUES (4, '计科2024-4（专升本）', 'GC54iUQrMxawuRLUZG', 1, 1, 1, '2026-03-26 14:35:00.848', '2026-03-26 14:35:44.049');
COMMIT;

-- ----------------------------
-- Table structure for exam_record
-- ----------------------------
DROP TABLE IF EXISTS `exam_record`;
CREATE TABLE `exam_record` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `paper_id` bigint NOT NULL,
  `student_id` bigint NOT NULL,
  `exam_name_snapshot` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_snapshot` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `class_name_snapshot` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_score` int NOT NULL DEFAULT '0',
  `objective_score` int NOT NULL DEFAULT '0',
  `subjective_score` int NOT NULL DEFAULT '0',
  `status` tinyint NOT NULL DEFAULT '0',
  `started_at` datetime(3) DEFAULT NULL,
  `submit_time` datetime(3) DEFAULT NULL,
  `marked_at` datetime(3) DEFAULT NULL,
  `forced_submit` tinyint NOT NULL DEFAULT '0',
  `cheat_count` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_exam_record_paper_student` (`paper_id`,`student_id`),
  KEY `idx_exam_record_student_id` (`student_id`),
  KEY `idx_exam_record_status` (`status`),
  KEY `idx_exam_record_submit_time` (`submit_time`),
  CONSTRAINT `exam_record_paper_id_fkey` FOREIGN KEY (`paper_id`) REFERENCES `paper` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `exam_record_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of exam_record
-- ----------------------------
BEGIN;
INSERT INTO `exam_record` (`id`, `paper_id`, `student_id`, `exam_name_snapshot`, `subject_snapshot`, `class_name_snapshot`, `total_score`, `objective_score`, `subjective_score`, `status`, `started_at`, `submit_time`, `marked_at`, `forced_submit`, `cheat_count`, `created_at`, `updated_at`) VALUES (18, 14, 1, '2025年计算机学科专业基础考试', 'cs_408', '', 2, 2, 0, 2, '2026-03-29 10:39:40.559', '2026-03-29 10:39:54.246', NULL, 0, 0, '2026-03-29 10:39:40.560', '2026-03-29 10:39:54.253');
COMMIT;

-- ----------------------------
-- Table structure for exam_record_answer
-- ----------------------------
DROP TABLE IF EXISTS `exam_record_answer`;
CREATE TABLE `exam_record_answer` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `record_id` bigint NOT NULL,
  `question_id` bigint DEFAULT NULL,
  `paper_question_id` bigint NOT NULL,
  `answer` json DEFAULT NULL,
  `is_correct` tinyint NOT NULL DEFAULT '0',
  `score` int NOT NULL DEFAULT '0',
  `comment` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_record_answer_paper_question` (`record_id`,`paper_question_id`),
  KEY `idx_record_answer_record_id` (`record_id`),
  KEY `idx_record_answer_question_id` (`question_id`),
  KEY `idx_record_answer_paper_question_id` (`paper_question_id`),
  CONSTRAINT `exam_record_answer_paper_question_id_fkey` FOREIGN KEY (`paper_question_id`) REFERENCES `paper_question` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `exam_record_answer_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `exam_record_answer_record_id_fkey` FOREIGN KEY (`record_id`) REFERENCES `exam_record` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=78 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of exam_record_answer
-- ----------------------------
BEGIN;
INSERT INTO `exam_record_answer` (`id`, `record_id`, `question_id`, `paper_question_id`, `answer`, `is_correct`, `score`, `comment`, `created_at`, `updated_at`) VALUES (77, 18, 16, 56, '\"B\"', 1, 2, NULL, '2026-03-29 10:39:54.256', '2026-03-29 10:39:54.256');
COMMIT;

-- ----------------------------
-- Table structure for login_log
-- ----------------------------
DROP TABLE IF EXISTS `login_log`;
CREATE TABLE `login_log` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint DEFAULT NULL,
  `username_snapshot` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `browser` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `os` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint NOT NULL,
  `message` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `login_time` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_login_status` (`status`),
  KEY `login_log_user_id_fkey` (`user_id`),
  CONSTRAINT `login_log_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=104 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of login_log
-- ----------------------------
BEGIN;
INSERT INTO `login_log` (`id`, `user_id`, `username_snapshot`, `ip`, `location`, `browser`, `os`, `status`, `message`, `login_time`) VALUES (99, 2, 'teacher', '::1', '未知', 'Chrome', 'macOS', 1, '登录成功', '2026-03-29 10:44:21.661');
INSERT INTO `login_log` (`id`, `user_id`, `username_snapshot`, `ip`, `location`, `browser`, `os`, `status`, `message`, `login_time`) VALUES (100, 2, 'teacher', '::ffff:127.0.0.1', '未知', 'Unknown', 'Unknown', 1, '登录成功', '2026-03-29 14:00:37.498');
INSERT INTO `login_log` (`id`, `user_id`, `username_snapshot`, `ip`, `location`, `browser`, `os`, `status`, `message`, `login_time`) VALUES (101, 2, 'teacher', '::ffff:127.0.0.1', '未知', 'Unknown', 'Unknown', 1, '登录成功', '2026-03-29 14:01:18.884');
INSERT INTO `login_log` (`id`, `user_id`, `username_snapshot`, `ip`, `location`, `browser`, `os`, `status`, `message`, `login_time`) VALUES (102, 11, 'student', '::ffff:127.0.0.1', '未知', 'Unknown', 'Unknown', 1, '登录成功', '2026-03-29 14:01:19.282');
INSERT INTO `login_log` (`id`, `user_id`, `username_snapshot`, `ip`, `location`, `browser`, `os`, `status`, `message`, `login_time`) VALUES (103, 1, 'admin', '::ffff:127.0.0.1', '未知', 'Chrome', 'macOS', 1, '登录成功', '2026-03-31 09:51:11.423');
COMMIT;

-- ----------------------------
-- Table structure for monitor_log
-- ----------------------------
DROP TABLE IF EXISTS `monitor_log`;
CREATE TABLE `monitor_log` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `paper_id` bigint NOT NULL,
  `student_id` bigint DEFAULT NULL,
  `operator_id` bigint DEFAULT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `result` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `idx_monitor_log_paper_id` (`paper_id`),
  KEY `idx_monitor_log_student_id` (`student_id`),
  KEY `monitor_log_operator_id_fkey` (`operator_id`),
  CONSTRAINT `monitor_log_operator_id_fkey` FOREIGN KEY (`operator_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `monitor_log_paper_id_fkey` FOREIGN KEY (`paper_id`) REFERENCES `paper` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `monitor_log_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `sys_user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of monitor_log
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for notice
-- ----------------------------
DROP TABLE IF EXISTS `notice`;
CREATE TABLE `notice` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `content` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `publisher_id` bigint NOT NULL,
  `publish_time` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `notice_publisher_id_fkey` (`publisher_id`),
  CONSTRAINT `notice_publisher_id_fkey` FOREIGN KEY (`publisher_id`) REFERENCES `sys_user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of notice
-- ----------------------------
BEGIN;
INSERT INTO `notice` (`id`, `title`, `content`, `type`, `status`, `publisher_id`, `publish_time`, `created_at`, `updated_at`) VALUES (1, '关于春季考试安排的通知', '请相关教师与学生关注考试时间与班级安排。', 'exam', 1, 1, '2026-03-26 16:07:48.016', '2026-03-24 15:02:54.805', '2026-03-26 16:07:48.018');
COMMIT;

-- ----------------------------
-- Table structure for paper
-- ----------------------------
DROP TABLE IF EXISTS `paper`;
CREATE TABLE `paper` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `paper_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_score` int NOT NULL,
  `duration` int NOT NULL,
  `start_time` datetime(3) DEFAULT NULL,
  `end_time` datetime(3) DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '0',
  `creator_id` bigint NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_paper_subject` (`subject`),
  KEY `idx_paper_status` (`status`),
  KEY `idx_paper_creator_id` (`creator_id`),
  CONSTRAINT `paper_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `sys_user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of paper
-- ----------------------------
BEGIN;
INSERT INTO `paper` (`id`, `paper_name`, `subject`, `total_score`, `duration`, `start_time`, `end_time`, `status`, `creator_id`, `created_at`, `updated_at`) VALUES (14, '2025年计算机学科专业基础考试', 'cs_408', 2, 150, '2026-03-29 10:36:07.000', '2026-03-29 13:06:07.000', 1, 1, '2026-03-29 10:36:36.356', '2026-03-29 10:39:24.718');
COMMIT;

-- ----------------------------
-- Table structure for paper_question
-- ----------------------------
DROP TABLE IF EXISTS `paper_question`;
CREATE TABLE `paper_question` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `paper_id` bigint NOT NULL,
  `question_id` bigint DEFAULT NULL,
  `subject` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` json DEFAULT NULL,
  `answer` json DEFAULT NULL,
  `analysis` text COLLATE utf8mb4_unicode_ci,
  `sort_order` int NOT NULL,
  `score` int NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_paper_question_sort` (`paper_id`,`sort_order`),
  KEY `idx_paper_question_paper_sort` (`paper_id`,`sort_order`),
  KEY `idx_paper_question_question_id` (`question_id`),
  CONSTRAINT `paper_question_paper_id_fkey` FOREIGN KEY (`paper_id`) REFERENCES `paper` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `paper_question_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of paper_question
-- ----------------------------
BEGIN;
INSERT INTO `paper_question` (`id`, `paper_id`, `question_id`, `subject`, `type`, `title`, `options`, `answer`, `analysis`, `sort_order`, `score`, `created_at`) VALUES (56, 14, 16, 'cs_408', 'judge', '<p>在含有 <strong>12</strong> 个结点的平衡二叉树（AVL 树）中，其高度最大为（ ）。（注：根结点高度为 1）</p>', '{\"A\": \"<p>4</p>\", \"B\": \"<p>5</p>\", \"C\": \"<p>6</p>\", \"D\": \"<p>7</p>\"}', '\"B\"', '<p>根据平衡二叉树结点数与高度的关系公式：$N_h = N_{h-1} + N_{h-2} + 1$，其中 $N_1=1, N_2=2$。<br />计算得：$N_3=4, N_4=7, N_5=12$。因此高度最大为 5。</p>', 1, 2, '2026-03-29 10:36:36.356');
COMMIT;

-- ----------------------------
-- Table structure for paper_target_class
-- ----------------------------
DROP TABLE IF EXISTS `paper_target_class`;
CREATE TABLE `paper_target_class` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `paper_id` bigint NOT NULL,
  `class_id` bigint NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_paper_target_class` (`paper_id`,`class_id`),
  KEY `idx_paper_target_class_paper_id` (`paper_id`),
  KEY `idx_paper_target_class_class_id` (`class_id`),
  CONSTRAINT `paper_target_class_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `edu_class` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `paper_target_class_paper_id_fkey` FOREIGN KEY (`paper_id`) REFERENCES `paper` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of paper_target_class
-- ----------------------------
BEGIN;
COMMIT;

-- ----------------------------
-- Table structure for question
-- ----------------------------
DROP TABLE IF EXISTS `question`;
CREATE TABLE `question` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `subject` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` bigint DEFAULT NULL,
  `type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `score` int NOT NULL,
  `options` json DEFAULT NULL,
  `answer` json DEFAULT NULL,
  `analysis` text COLLATE utf8mb4_unicode_ci,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_question_category_id` (`category_id`),
  KEY `idx_question_subject` (`subject`),
  KEY `idx_question_type` (`type`),
  CONSTRAINT `question_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `question_category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of question
-- ----------------------------
BEGIN;
INSERT INTO `question` (`id`, `subject`, `category_id`, `type`, `title`, `score`, `options`, `answer`, `analysis`, `status`, `created_at`, `updated_at`) VALUES (16, 'cs_408', 10, 'judge', '<p>在含有 <strong>12</strong> 个结点的平衡二叉树（AVL 树）中，其高度最大为（ ）。（注：根结点高度为 1）</p>', 2, '{\"A\": \"<p>4</p>\", \"B\": \"<p>5</p>\", \"C\": \"<p>6</p>\", \"D\": \"<p>7</p>\"}', '\"B\"', '<p>根据平衡二叉树结点数与高度的关系公式：$N_h = N_{h-1} + N_{h-2} + 1$，其中 $N_1=1, N_2=2$。<br />计算得：$N_3=4, N_4=7, N_5=12$。因此高度最大为 5。</p>', 1, '2026-03-29 10:34:12.060', '2026-03-29 10:34:12.060');
INSERT INTO `question` (`id`, `subject`, `category_id`, `type`, `title`, `score`, `options`, `answer`, `analysis`, `status`, `created_at`, `updated_at`) VALUES (17, 'cs_408', 11, 'judge', '<p>主机甲与主机乙已建立一个 TCP 连接，最大段长 <strong>MSS</strong> 为 <strong>1KB</strong>。当拥塞窗口 <strong>cwnd</strong> 为 <strong>16KB</strong> 时，甲发送了 16 个段并收到全部确认。随后甲发生超时（Timeout），则甲重传后的慢开始门限 <strong>ssthresh</strong> 和下一次的 <strong>cwnd</strong> 分别为（ ）。</p>', 2, '{\"A\": \"<p>8KB, 1KB</p>\", \"B\": \"<p>8KB, 2KB</p>\", \"C\": \"<p>16KB, 1KB</p>\", \"D\": \"<p> 16KB, 2KB</p>\"}', '\"A\"', '', 1, '2026-03-29 14:48:29.689', '2026-03-29 14:48:29.689');
INSERT INTO `question` (`id`, `subject`, `category_id`, `type`, `title`, `score`, `options`, `answer`, `analysis`, `status`, `created_at`, `updated_at`) VALUES (18, 'cs_408', 12, 'judge', '<p>现有 <strong>3</strong> 个进程共享 <strong>4</strong> 台打印机，每个进程最多请求 <strong>2</strong> 台。在这种情况下，系统（ ）。</p>', 2, '{\"A\": \"<p>必然会发生死锁</p>\", \"B\": \"<p>可能会发生死锁</p>\", \"C\": \"<p>绝不会发生死锁</p>\", \"D\": \"<p>无法确定死锁状态</p>\"}', '\"C\"', '', 1, '2026-03-29 14:49:47.063', '2026-03-29 14:49:47.063');
INSERT INTO `question` (`id`, `subject`, `category_id`, `type`, `title`, `score`, `options`, `answer`, `analysis`, `status`, `created_at`, `updated_at`) VALUES (19, 'cs_408', 13, 'judge', '<p>若使用 <strong>128K $\\times$ 8位</strong> 的 RAM 芯片构造一个 <strong>512K $\\times$ 16位</strong> 的存储器，则需要的芯片总数为（ ）。</p>', 2, '{\"A\": \"<p>4 片</p>\", \"B\": \"<li>8 片</li><li></li>\", \"C\": \"<p>16 片</p>\", \"D\": \"<p>32 片</p>\"}', '\"B\"', '<p>字扩展：$512K / 128K = 4$；位扩展：$16位 / 8位 = 2$。总数 = $4 \\times 2 = 8$ 片。</p>', 1, '2026-03-29 14:50:53.600', '2026-03-29 14:50:53.600');
INSERT INTO `question` (`id`, `subject`, `category_id`, `type`, `title`, `score`, `options`, `answer`, `analysis`, `status`, `created_at`, `updated_at`) VALUES (20, 'cs_408', 14, 'select', '<p>对于一个有向图 $G$，下列关于强连通分量的说法中，<strong>正确</strong>的有（ ）。</p>', 2, '{\"A\": \"<p>强连通分量是有向图中的极大强连通子图。</p>\", \"B\": \"<p>任何有向图都至少包含一个强连通分量。</p>\", \"C\": \"<p>使用深度优先遍历（DFS）可以求出有向图的所有强连通分量。</p>\", \"D\": \"<p>强连通图中只有一个强连通分量，即其自身。</p>\"}', '[\"D\", \"C\", \"B\", \"A\"]', '', 1, '2026-03-29 14:53:46.162', '2026-03-29 14:53:46.162');
INSERT INTO `question` (`id`, `subject`, `category_id`, `type`, `title`, `score`, `options`, `answer`, `analysis`, `status`, `created_at`, `updated_at`) VALUES (21, 'cs_408', 15, 'select', '<p>下列选项中，可能导致进程从<strong>执行态</strong>（Running）转变为<strong>阻塞态</strong>（Blocked）的事件有（ ）。</p>', 2, '{\"A\": \"<p>进程执行了 P 操作（Wait）。</p>\", \"B\": \"<p>进程启动了 I/O 设备请求。</p>\", \"C\": \"<p>调度程序选择了优先级更高的进程。</p>\", \"D\": \"<p>时间片用完。</p>\"}', '[\"A\", \"B\"]', '<p>C 和 D 会导致进程进入<strong>就绪态</strong>（Ready），只有等待资源或人工干预才会进入阻塞态。</p>', 1, '2026-03-29 14:55:07.762', '2026-03-29 14:55:07.762');
INSERT INTO `question` (`id`, `subject`, `category_id`, `type`, `title`, `score`, `options`, `answer`, `analysis`, `status`, `created_at`, `updated_at`) VALUES (22, 'cs_408', 16, 'select', '<p>关于 IPv6 协议，下列描述<strong>错误</strong>的有（ ）。</p>', 2, '{\"A\": \"<p>IPv6 地址长度为 64 位。</p>\", \"B\": \"<p>IPv6 不再支持广播（Broadcast）地址，改用组播。</p>\", \"C\": \"<p> IPv6 首部字段包含“首部校验和（Checksum）”以提高传输效率。</p>\", \"D\": \"<p>IPv6 支持通过即插即用（Auto-configuration）自动获取地址。</p>\"}', '[\"C\", \"A\"]', '<p>IPv6 地址是 <strong>128 位</strong>；为了提高路由器的转发速度，IPv6 <strong>取消了首部校验和</strong>。</p>', 1, '2026-03-29 14:56:12.557', '2026-03-29 14:56:12.557');
INSERT INTO `question` (`id`, `subject`, `category_id`, `type`, `title`, `score`, `options`, `answer`, `analysis`, `status`, `created_at`, `updated_at`) VALUES (23, 'cs_408', 17, 'text', '<p>已知一个带有表头结点的单链表 $L$，每个结点只包含整数和 next 指针。请设计一个时间上尽可能高效的算法，查找链表中倒数第 $k$ 个结点（$k$ 为正整数）。若查找成功，输出该结点的 data 并返回 1；否则只返回 0。</p><p><strong>要求：</strong></p><ol><li>描述算法的基本设计思想。</li><li>给出算法的 C 语言实现。</li><li>说明你所设计算法的时间复杂度。</li></ol>', 13, 'null', '\"<ol><li>设计思想：采用双指针法（快慢指针）。定义两个指针 p 和 q，初始均指向头结点。先让 p 走 $k$ 步，然后 p 和 q 同时向后移动，当 p 到达链表末尾时，q 正好指向倒数第 $k$ 个结点。</li><li>代码实现：Cint findLastK(LinkList L, int k) { LNode *p = L-&gt;next, *q = L-&gt;next; int count = 0; while (p != NULL) { if (count &lt; k) count++; else q = q-&gt;next; p = p-&gt;next; } if (count &lt; k) return 0; printf(\\\"%d\\\", q-&gt;data); return 1; } 运行</li><li>复杂度：时间复杂度 $O(n)$，空间复杂度 $O(1)$。</li></ol>\"', '', 1, '2026-03-29 14:58:14.742', '2026-03-29 14:58:14.742');
INSERT INTO `question` (`id`, `subject`, `category_id`, `type`, `title`, `score`, `options`, `answer`, `analysis`, `status`, `created_at`, `updated_at`) VALUES (24, 'cs_408', 18, 'text', '<p>假设某指令流水线分为 <strong>取指(IF)</strong>、<strong>译码(ID)</strong>、<strong>执行(EX)</strong>、<strong>访存(MEM)</strong>、<strong>写回(WB)</strong> 五段。每个段的执行时间均为 $\\Delta t$。现有 <strong>50</strong> 条指令连续进入该流水线。</p><p>请回答：</p><ol><li>计算该流水线处理完这 50 条指令的总时间。</li><li>计算该流水线的实际吞吐率（TPS）。</li><li>若此时发生“资源冲突”，应采取什么措施解决？</li></ol>', 10, 'null', '\"<ol><li>总时间：$T = (k + n - 1)\\\\Delta t = (5 + 50 - 1)\\\\Delta t = 54\\\\Delta t$。</li><li>吞吐率：$TPS = n / T = 50 / 54\\\\Delta t \\\\approx 0.926 / \\\\Delta t$。</li><li>措施：插入空操作指令（NOP）。增加硬件资源（如指令和数据存储器分开）。由编译器进行指令调度。</li></ol>\"', '', 1, '2026-03-29 14:59:04.847', '2026-03-29 14:59:04.847');
INSERT INTO `question` (`id`, `subject`, `category_id`, `type`, `title`, `score`, `options`, `answer`, `analysis`, `status`, `created_at`, `updated_at`) VALUES (25, 'math_2', 19, 'judge', '<p>当 $x \\to 0$ 时，若 $f(x) = \\cos x - e^{-\\frac{x^2}{2}}$ 是 $x^n$ 的高阶无穷小，则正整数 $n$ 的最大值为（ ）。</p>', 5, '{\"A\": \"<p>2</p>\", \"B\": \"<p>3</p>\", \"C\": \"<p>4</p>\", \"D\": \"<p>5</p>\"}', '\"C\"', '<p>使用泰勒展开：$\\cos x = 1 - \\frac{x^2}{2} + \\frac{x^4}{24} + o(x^4)$，$e^{-\\frac{x^2}{2}} = 1 - \\frac{x^2}{2} + \\frac{1}{2}(-\\frac{x^2}{2})^2 + o(x^4) = 1 - \\frac{x^2}{2} + \\frac{x^4}{8} + o(x^4)$。相减后首项为 $x^4$，故 $n$ 最大为 4。</p>', 1, '2026-03-29 15:19:15.477', '2026-03-29 15:19:15.477');
INSERT INTO `question` (`id`, `subject`, `category_id`, `type`, `title`, `score`, `options`, `answer`, `analysis`, `status`, `created_at`, `updated_at`) VALUES (26, 'math_2', 20, 'text', '<p>曲线 $y = \\ln x$ 在点 $(1, 0)$ 处的曲率 $\\kappa$ 为 ______。</p>', 5, 'null', '\"<p>$\\\\frac{\\\\sqrt{2}}{4}$（或录入为 sqrt(2)/4）</p>\"', '<p>$y\' = 1/x, y\'\' = -1/x^2$。在 $x=1$ 处，$y\'=1, y\'\'=-1$。代入曲率公式 $\\kappa = \\frac{|y\'\'|}{(1+y\'^2)^{3/2}} = \\frac{1}{(1+1)^{3/2}} = \\frac{1}{2\\sqrt{2}} = \\frac{\\sqrt{2}}{4}$。</p>', 1, '2026-03-29 15:21:50.843', '2026-03-29 15:21:50.843');
COMMIT;

-- ----------------------------
-- Table structure for question_category
-- ----------------------------
DROP TABLE IF EXISTS `question_category`;
CREATE TABLE `question_category` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_question_category_subject_name` (`subject`,`name`),
  KEY `idx_question_category_subject` (`subject`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of question_category
-- ----------------------------
BEGIN;
INSERT INTO `question_category` (`id`, `name`, `subject`, `description`, `status`, `created_at`, `updated_at`) VALUES (10, '数据结构 - 树与二叉树', 'cs_408', '无', 1, '2026-03-29 10:33:04.555', '2026-03-29 10:34:58.227');
INSERT INTO `question_category` (`id`, `name`, `subject`, `description`, `status`, `created_at`, `updated_at`) VALUES (11, '计算机网络 - 传输层', 'cs_408', '无', 1, '2026-03-29 14:46:49.112', '2026-03-29 14:46:49.112');
INSERT INTO `question_category` (`id`, `name`, `subject`, `description`, `status`, `created_at`, `updated_at`) VALUES (12, '操作系统 - 进程管理', 'cs_408', '无', 1, '2026-03-29 14:48:38.123', '2026-03-29 14:48:38.123');
INSERT INTO `question_category` (`id`, `name`, `subject`, `description`, `status`, `created_at`, `updated_at`) VALUES (13, '计组 - 存储器层次结构', 'cs_408', '无', 1, '2026-03-29 14:49:58.698', '2026-03-29 14:49:58.698');
INSERT INTO `question_category` (`id`, `name`, `subject`, `description`, `status`, `created_at`, `updated_at`) VALUES (14, '数据结构 - 图论', 'cs_408', '无', 1, '2026-03-29 14:52:50.418', '2026-03-29 14:52:50.418');
INSERT INTO `question_category` (`id`, `name`, `subject`, `description`, `status`, `created_at`, `updated_at`) VALUES (15, '操作系统 - 进程管理2', 'cs_408', '无', 1, '2026-03-29 14:54:10.304', '2026-03-29 14:54:10.304');
INSERT INTO `question_category` (`id`, `name`, `subject`, `description`, `status`, `created_at`, `updated_at`) VALUES (16, '计算机网络 - 网络层', 'cs_408', '无', 1, '2026-03-29 14:55:19.949', '2026-03-29 14:55:19.949');
INSERT INTO `question_category` (`id`, `name`, `subject`, `description`, `status`, `created_at`, `updated_at`) VALUES (17, '数据结构 - 线性表/算法', 'cs_408', '无', 1, '2026-03-29 14:56:54.822', '2026-03-29 14:56:54.822');
INSERT INTO `question_category` (`id`, `name`, `subject`, `description`, `status`, `created_at`, `updated_at`) VALUES (18, '计组 - 中央处理器/流水线', 'cs_408', '无', 1, '2026-03-29 14:58:28.472', '2026-03-29 14:58:28.472');
INSERT INTO `question_category` (`id`, `name`, `subject`, `description`, `status`, `created_at`, `updated_at`) VALUES (19, '高数 - 极限', 'math_2', '无', 1, '2026-03-29 15:07:34.699', '2026-03-29 15:19:45.223');
INSERT INTO `question_category` (`id`, `name`, `subject`, `description`, `status`, `created_at`, `updated_at`) VALUES (20, '高数 - 曲线曲率', 'math_2', '无', 1, '2026-03-29 15:19:39.639', '2026-03-29 15:19:39.639');
COMMIT;

-- ----------------------------
-- Table structure for subject
-- ----------------------------
DROP TABLE IF EXISTS `subject`;
CREATE TABLE `subject` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `subject_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `subject_subject_code_key` (`subject_code`),
  UNIQUE KEY `subject_subject_name_key` (`subject_name`),
  KEY `idx_subject_sort_order` (`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of subject
-- ----------------------------
BEGIN;
INSERT INTO `subject` (`id`, `subject_code`, `subject_name`, `sort_order`, `created_at`, `updated_at`) VALUES (10, 'cs_408', '计算机学科专业基础 (408)', 1, '2026-03-29 08:37:57.292', '2026-03-29 08:38:54.255');
INSERT INTO `subject` (`id`, `subject_code`, `subject_name`, `sort_order`, `created_at`, `updated_at`) VALUES (11, 'math_2', '高等数学与线性代数 (数学二)', 2, '2026-03-29 08:38:46.943', '2026-03-29 08:38:46.943');
COMMIT;

-- ----------------------------
-- Table structure for sys_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_role`;
CREATE TABLE `sys_role` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `role_code` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sys_role_role_code_key` (`role_code`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of sys_role
-- ----------------------------
BEGIN;
INSERT INTO `sys_role` (`id`, `role_code`, `role_name`, `created_at`, `updated_at`) VALUES (1, 'admin', '管理员', '2026-03-24 15:02:54.779', '2026-03-26 16:07:47.982');
INSERT INTO `sys_role` (`id`, `role_code`, `role_name`, `created_at`, `updated_at`) VALUES (2, 'teacher', '教师', '2026-03-24 15:02:54.789', '2026-03-26 16:07:47.986');
INSERT INTO `sys_role` (`id`, `role_code`, `role_name`, `created_at`, `updated_at`) VALUES (3, 'student', '学生', '2026-03-24 15:02:54.790', '2026-03-26 16:07:47.987');
COMMIT;

-- ----------------------------
-- Table structure for sys_user
-- ----------------------------
DROP TABLE IF EXISTS `sys_user`;
CREATE TABLE `sys_user` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `real_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `class_id` bigint DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT '1',
  `last_login_time` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sys_user_username_key` (`username`),
  KEY `idx_class_id` (`class_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `sys_user_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `edu_class` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of sys_user
-- ----------------------------
BEGIN;
INSERT INTO `sys_user` (`id`, `username`, `password_hash`, `real_name`, `avatar`, `class_id`, `status`, `last_login_time`, `created_at`, `updated_at`) VALUES (1, 'admin', '$2a$10$O8tMd9YaNomyMBTj/mbTL.dM7PYoE6xPJeuhohVYMMd7xq6HlRjDq', '管理员', NULL, NULL, 1, '2026-03-31 09:51:11.409', '2026-03-24 15:02:54.791', '2026-03-31 09:51:11.410');
INSERT INTO `sys_user` (`id`, `username`, `password_hash`, `real_name`, `avatar`, `class_id`, `status`, `last_login_time`, `created_at`, `updated_at`) VALUES (2, 'teacher', '$2a$10$O8tMd9YaNomyMBTj/mbTL.dM7PYoE6xPJeuhohVYMMd7xq6HlRjDq', '示例教师', NULL, NULL, 1, '2026-03-29 14:01:18.880', '2026-03-24 15:02:54.794', '2026-03-29 14:01:18.881');
INSERT INTO `sys_user` (`id`, `username`, `password_hash`, `real_name`, `avatar`, `class_id`, `status`, `last_login_time`, `created_at`, `updated_at`) VALUES (4, '朱哈哈', '$2a$10$pRfaYz0fNqPZJo4blgJ0U.vvTe/Vmw0Ykh2yUQsUqzfIqS57Io7V6', '朱霆锋', NULL, 3, 1, '2026-03-27 08:29:53.051', '2026-03-24 18:03:08.304', '2026-03-27 08:29:53.052');
INSERT INTO `sys_user` (`id`, `username`, `password_hash`, `real_name`, `avatar`, `class_id`, `status`, `last_login_time`, `created_at`, `updated_at`) VALUES (10, '张哈哈', '$2a$10$Aw0PrSCEuX.iTT.Lb48ydugct/J.aE4A47uABO4/uzHpfnJKrWlOS', '大大的老子', NULL, 4, 1, NULL, '2026-03-26 14:35:44.044', '2026-03-26 14:35:44.044');
INSERT INTO `sys_user` (`id`, `username`, `password_hash`, `real_name`, `avatar`, `class_id`, `status`, `last_login_time`, `created_at`, `updated_at`) VALUES (11, 'student', '$2a$10$O8tMd9YaNomyMBTj/mbTL.dM7PYoE6xPJeuhohVYMMd7xq6HlRjDq', '示例学生', NULL, 3, 1, '2026-03-29 14:01:19.280', '2026-03-26 14:36:14.993', '2026-03-29 14:01:19.281');
COMMIT;

-- ----------------------------
-- Table structure for sys_user_role
-- ----------------------------
DROP TABLE IF EXISTS `sys_user_role`;
CREATE TABLE `sys_user_role` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_role` (`user_id`,`role_id`),
  KEY `sys_user_role_role_id_fkey` (`role_id`),
  CONSTRAINT `sys_user_role_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `sys_role` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `sys_user_role_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of sys_user_role
-- ----------------------------
BEGIN;
INSERT INTO `sys_user_role` (`id`, `user_id`, `role_id`) VALUES (1, 1, 1);
INSERT INTO `sys_user_role` (`id`, `user_id`, `role_id`) VALUES (11, 2, 2);
INSERT INTO `sys_user_role` (`id`, `user_id`, `role_id`) VALUES (12, 4, 3);
INSERT INTO `sys_user_role` (`id`, `user_id`, `role_id`) VALUES (13, 10, 3);
INSERT INTO `sys_user_role` (`id`, `user_id`, `role_id`) VALUES (17, 11, 3);
COMMIT;

-- ----------------------------
-- Table structure for wrong_book
-- ----------------------------
DROP TABLE IF EXISTS `wrong_book`;
CREATE TABLE `wrong_book` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `student_id` bigint NOT NULL,
  `record_id` bigint NOT NULL,
  `paper_question_id` bigint NOT NULL,
  `question_id` bigint DEFAULT NULL,
  `my_answer` json DEFAULT NULL,
  `correct_answer` json DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_wrong_book_student_record_paper_question` (`student_id`,`record_id`,`paper_question_id`),
  KEY `idx_wrong_book_student_id` (`student_id`),
  KEY `idx_wrong_book_question_id` (`question_id`),
  KEY `idx_wrong_book_paper_question_id` (`paper_question_id`),
  KEY `wrong_book_record_id_fkey` (`record_id`),
  CONSTRAINT `wrong_book_paper_question_id_fkey` FOREIGN KEY (`paper_question_id`) REFERENCES `paper_question` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `wrong_book_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `question` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `wrong_book_record_id_fkey` FOREIGN KEY (`record_id`) REFERENCES `exam_record` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `wrong_book_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `sys_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------
-- Records of wrong_book
-- ----------------------------
BEGIN;
COMMIT;

SET FOREIGN_KEY_CHECKS = 1;
