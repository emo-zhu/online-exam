-- CreateTable
CREATE TABLE `subject` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `subject_code` VARCHAR(30) NOT NULL,
    `subject_name` VARCHAR(50) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `subject_subject_code_key`(`subject_code`),
    UNIQUE INDEX `subject_subject_name_key`(`subject_name`),
    INDEX `idx_subject_sort_order`(`sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_category` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `subject` VARCHAR(30) NOT NULL,
    `description` VARCHAR(255) NULL,
    `status` TINYINT NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_question_category_subject`(`subject`),
    UNIQUE INDEX `uk_question_category_subject_name`(`subject`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `subject` VARCHAR(30) NOT NULL,
    `category_id` BIGINT NULL,
    `type` VARCHAR(30) NOT NULL,
    `title` TEXT NOT NULL,
    `score` INTEGER NOT NULL,
    `options` JSON NULL,
    `answer` JSON NULL,
    `analysis` TEXT NULL,
    `status` TINYINT NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_question_category_id`(`category_id`),
    INDEX `idx_question_subject`(`subject`),
    INDEX `idx_question_type`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paper` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `paper_name` VARCHAR(200) NOT NULL,
    `subject` VARCHAR(30) NOT NULL,
    `total_score` INTEGER NOT NULL,
    `duration` INTEGER NOT NULL,
    `start_time` DATETIME(3) NULL,
    `end_time` DATETIME(3) NULL,
    `status` TINYINT NOT NULL DEFAULT 0,
    `creator_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_paper_subject`(`subject`),
    INDEX `idx_paper_status`(`status`),
    INDEX `idx_paper_creator_id`(`creator_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paper_question` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `paper_id` BIGINT NOT NULL,
    `question_id` BIGINT NULL,
    `subject` VARCHAR(30) NOT NULL,
    `type` VARCHAR(30) NOT NULL,
    `title` TEXT NOT NULL,
    `options` JSON NULL,
    `answer` JSON NULL,
    `analysis` TEXT NULL,
    `sort_order` INTEGER NOT NULL,
    `score` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_paper_question_paper_sort`(`paper_id`, `sort_order`),
    INDEX `idx_paper_question_question_id`(`question_id`),
    UNIQUE INDEX `uk_paper_question_sort`(`paper_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paper_target_class` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `paper_id` BIGINT NOT NULL,
    `class_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_paper_target_class_paper_id`(`paper_id`),
    INDEX `idx_paper_target_class_class_id`(`class_id`),
    UNIQUE INDEX `uk_paper_target_class`(`paper_id`, `class_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_record` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `paper_id` BIGINT NOT NULL,
    `student_id` BIGINT NOT NULL,
    `exam_name_snapshot` VARCHAR(200) NOT NULL,
    `subject_snapshot` VARCHAR(30) NOT NULL,
    `class_name_snapshot` VARCHAR(100) NOT NULL,
    `total_score` INTEGER NOT NULL DEFAULT 0,
    `objective_score` INTEGER NOT NULL DEFAULT 0,
    `subjective_score` INTEGER NOT NULL DEFAULT 0,
    `status` TINYINT NOT NULL DEFAULT 0,
    `started_at` DATETIME(3) NULL,
    `submit_time` DATETIME(3) NULL,
    `marked_at` DATETIME(3) NULL,
    `forced_submit` TINYINT NOT NULL DEFAULT 0,
    `cheat_count` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_exam_record_student_id`(`student_id`),
    INDEX `idx_exam_record_status`(`status`),
    INDEX `idx_exam_record_submit_time`(`submit_time`),
    UNIQUE INDEX `uk_exam_record_paper_student`(`paper_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `exam_record_answer` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `record_id` BIGINT NOT NULL,
    `question_id` BIGINT NULL,
    `paper_question_id` BIGINT NOT NULL,
    `answer` JSON NULL,
    `is_correct` TINYINT NOT NULL DEFAULT 0,
    `score` INTEGER NOT NULL DEFAULT 0,
    `comment` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_record_answer_record_id`(`record_id`),
    INDEX `idx_record_answer_question_id`(`question_id`),
    INDEX `idx_record_answer_paper_question_id`(`paper_question_id`),
    UNIQUE INDEX `uk_record_answer_paper_question`(`record_id`, `paper_question_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wrong_book` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `student_id` BIGINT NOT NULL,
    `record_id` BIGINT NOT NULL,
    `paper_question_id` BIGINT NOT NULL,
    `question_id` BIGINT NULL,
    `my_answer` JSON NULL,
    `correct_answer` JSON NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_wrong_book_student_id`(`student_id`),
    INDEX `idx_wrong_book_question_id`(`question_id`),
    INDEX `idx_wrong_book_paper_question_id`(`paper_question_id`),
    UNIQUE INDEX `uk_wrong_book_student_record_paper_question`(`student_id`, `record_id`, `paper_question_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `monitor_log` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `paper_id` BIGINT NOT NULL,
    `student_id` BIGINT NULL,
    `operator_id` BIGINT NULL,
    `type` VARCHAR(50) NOT NULL,
    `content` VARCHAR(255) NOT NULL,
    `result` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_monitor_log_paper_id`(`paper_id`),
    INDEX `idx_monitor_log_student_id`(`student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `question` ADD CONSTRAINT `question_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `question_category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paper` ADD CONSTRAINT `paper_creator_id_fkey` FOREIGN KEY (`creator_id`) REFERENCES `sys_user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paper_question` ADD CONSTRAINT `paper_question_paper_id_fkey` FOREIGN KEY (`paper_id`) REFERENCES `paper`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paper_question` ADD CONSTRAINT `paper_question_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `question`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paper_target_class` ADD CONSTRAINT `paper_target_class_paper_id_fkey` FOREIGN KEY (`paper_id`) REFERENCES `paper`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paper_target_class` ADD CONSTRAINT `paper_target_class_class_id_fkey` FOREIGN KEY (`class_id`) REFERENCES `edu_class`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_record` ADD CONSTRAINT `exam_record_paper_id_fkey` FOREIGN KEY (`paper_id`) REFERENCES `paper`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_record` ADD CONSTRAINT `exam_record_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `sys_user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_record_answer` ADD CONSTRAINT `exam_record_answer_record_id_fkey` FOREIGN KEY (`record_id`) REFERENCES `exam_record`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_record_answer` ADD CONSTRAINT `exam_record_answer_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `question`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `exam_record_answer` ADD CONSTRAINT `exam_record_answer_paper_question_id_fkey` FOREIGN KEY (`paper_question_id`) REFERENCES `paper_question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wrong_book` ADD CONSTRAINT `wrong_book_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `sys_user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wrong_book` ADD CONSTRAINT `wrong_book_record_id_fkey` FOREIGN KEY (`record_id`) REFERENCES `exam_record`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wrong_book` ADD CONSTRAINT `wrong_book_paper_question_id_fkey` FOREIGN KEY (`paper_question_id`) REFERENCES `paper_question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wrong_book` ADD CONSTRAINT `wrong_book_question_id_fkey` FOREIGN KEY (`question_id`) REFERENCES `question`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `monitor_log` ADD CONSTRAINT `monitor_log_paper_id_fkey` FOREIGN KEY (`paper_id`) REFERENCES `paper`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `monitor_log` ADD CONSTRAINT `monitor_log_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `sys_user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `monitor_log` ADD CONSTRAINT `monitor_log_operator_id_fkey` FOREIGN KEY (`operator_id`) REFERENCES `sys_user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
