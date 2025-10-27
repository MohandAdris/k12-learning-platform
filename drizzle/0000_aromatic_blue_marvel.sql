CREATE TABLE `analytics_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int,
	`session_id` varchar(100),
	`event_type` varchar(100) NOT NULL,
	`props` json,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analytics_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attachments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lecture_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`title_ar` varchar(255),
	`title_he` varchar(255),
	`file_url` varchar(500) NOT NULL,
	`file_url_ar` varchar(500),
	`file_url_he` varchar(500),
	`file_type` varchar(50) NOT NULL,
	`file_size` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attachments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actor_user_id` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`entity_type` varchar(100) NOT NULL,
	`entity_id` int,
	`meta` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`title_ar` varchar(255),
	`title_he` varchar(255),
	`description` text NOT NULL,
	`description_ar` text,
	`description_he` text,
	`thumbnail_url` varchar(500),
	`tags` json NOT NULL,
	`tags_ar` json NOT NULL,
	`tags_he` json NOT NULL,
	`course_visibility` enum('PUBLIC','PRIVATE') NOT NULL DEFAULT 'PUBLIC',
	`prerequisites` text,
	`prerequisites_ar` text,
	`prerequisites_he` text,
	`learning_outcomes` text,
	`learning_outcomes_ar` text,
	`learning_outcomes_he` text,
	`estimated_duration` int,
	`created_by` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`published_at` timestamp,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `enrollments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`course_id` int NOT NULL,
	`enrollment_status` enum('ACTIVE','COMPLETED','DROPPED') NOT NULL DEFAULT 'ACTIVE',
	`completed_at` timestamp,
	`last_accessed_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `enrollments_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_course_unique` UNIQUE(`user_id`,`course_id`)
);
--> statement-breakpoint
CREATE TABLE `game_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`game_id` int NOT NULL,
	`unit_id` int NOT NULL,
	`score` float,
	`completed` boolean NOT NULL DEFAULT false,
	`duration_sec` int,
	`raw_events` json,
	`language` enum('en','ar','he') NOT NULL DEFAULT 'en',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	CONSTRAINT `game_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `interactive_games` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`title_ar` varchar(255),
	`title_he` varchar(255),
	`game_type` enum('LTI','SCORM','XAPI','HTML5') NOT NULL,
	`launch_url` varchar(500),
	`launch_url_ar` varchar(500),
	`launch_url_he` varchar(500),
	`config` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `interactive_games_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lectures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unit_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`title_ar` varchar(255),
	`title_he` varchar(255),
	`description` text,
	`description_ar` text,
	`description_he` text,
	`order` int NOT NULL,
	`video_url` varchar(500) NOT NULL,
	`video_url_ar` varchar(500),
	`video_url_he` varchar(500),
	`duration_sec` int NOT NULL,
	`captions_url` varchar(500),
	`captions_url_ar` varchar(500),
	`captions_url_he` varchar(500),
	`summary_markdown` text,
	`summary_markdown_ar` text,
	`summary_markdown_he` text,
	`references` json,
	`available_from` timestamp,
	`available_until` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `lectures_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`lecture_id` int NOT NULL,
	`position_sec` int NOT NULL DEFAULT 0,
	`completed` boolean NOT NULL DEFAULT false,
	`language` enum('en','ar','he') NOT NULL DEFAULT 'en',
	`last_seen_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_lecture_unique` UNIQUE(`user_id`,`lecture_id`)
);
--> statement-breakpoint
CREATE TABLE `refresh_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `refresh_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `refresh_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `schools` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`name_ar` varchar(255),
	`name_he` varchar(255),
	`region` varchar(100),
	`contact_email` varchar(320),
	`meta` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `schools_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` json NOT NULL,
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `system_config_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `translation_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source_text` text NOT NULL,
	`source_lang` varchar(10) NOT NULL,
	`target_lang` varchar(10) NOT NULL,
	`translation` text NOT NULL,
	`context` varchar(100),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `translation_cache_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `unit_games` (
	`id` int AUTO_INCREMENT NOT NULL,
	`unit_id` int NOT NULL,
	`game_id` int NOT NULL,
	`required_to_complete` boolean NOT NULL DEFAULT false,
	`scoring_rules` json,
	`order` int NOT NULL DEFAULT 0,
	CONSTRAINT `unit_games_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `units` (
	`id` int AUTO_INCREMENT NOT NULL,
	`course_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`title_ar` varchar(255),
	`title_he` varchar(255),
	`description` text,
	`description_ar` text,
	`description_he` text,
	`order` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `units_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`open_id` varchar(64) NOT NULL,
	`user_role` enum('STUDENT','TEACHER','ADMIN') NOT NULL DEFAULT 'STUDENT',
	`external_id` varchar(64) NOT NULL,
	`email` varchar(320),
	`password_hash` text NOT NULL,
	`first_name` varchar(100) NOT NULL,
	`last_name` varchar(100) NOT NULL,
	`school_id` int,
	`language` enum('en','ar','he') NOT NULL DEFAULT 'en',
	`failed_login_attempts` int NOT NULL DEFAULT 0,
	`locked_until` timestamp,
	`two_factor_secret` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`last_login_at` timestamp,
	`last_signed_in` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_open_id_unique` UNIQUE(`open_id`),
	CONSTRAINT `users_external_id_unique` UNIQUE(`external_id`)
);
--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `analytics_events` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_id_idx` ON `analytics_events` (`session_id`);--> statement-breakpoint
CREATE INDEX `event_type_idx` ON `analytics_events` (`event_type`);--> statement-breakpoint
CREATE INDEX `timestamp_idx` ON `analytics_events` (`timestamp`);--> statement-breakpoint
CREATE INDEX `lecture_id_idx` ON `attachments` (`lecture_id`);--> statement-breakpoint
CREATE INDEX `actor_user_id_idx` ON `audit_logs` (`actor_user_id`);--> statement-breakpoint
CREATE INDEX `entity_type_id_idx` ON `audit_logs` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `created_by_idx` ON `courses` (`created_by`);--> statement-breakpoint
CREATE INDEX `visibility_idx` ON `courses` (`course_visibility`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `enrollments` (`user_id`);--> statement-breakpoint
CREATE INDEX `course_id_idx` ON `enrollments` (`course_id`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `enrollments` (`enrollment_status`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `game_sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `game_id_idx` ON `game_sessions` (`game_id`);--> statement-breakpoint
CREATE INDEX `unit_id_idx` ON `game_sessions` (`unit_id`);--> statement-breakpoint
CREATE INDEX `completed_idx` ON `game_sessions` (`completed`);--> statement-breakpoint
CREATE INDEX `unit_id_order_idx` ON `lectures` (`unit_id`,`order`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `progress` (`user_id`);--> statement-breakpoint
CREATE INDEX `lecture_id_idx` ON `progress` (`lecture_id`);--> statement-breakpoint
CREATE INDEX `completed_idx` ON `progress` (`completed`);--> statement-breakpoint
CREATE INDEX `user_id_idx` ON `refresh_tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `token_idx` ON `refresh_tokens` (`token`);--> statement-breakpoint
CREATE INDEX `name_idx` ON `schools` (`name`);--> statement-breakpoint
CREATE INDEX `source_lang_target_lang_idx` ON `translation_cache` (`source_lang`,`target_lang`);--> statement-breakpoint
CREATE INDEX `unit_id_idx` ON `unit_games` (`unit_id`);--> statement-breakpoint
CREATE INDEX `game_id_idx` ON `unit_games` (`game_id`);--> statement-breakpoint
CREATE INDEX `course_id_order_idx` ON `units` (`course_id`,`order`);--> statement-breakpoint
CREATE INDEX `external_id_idx` ON `users` (`external_id`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `school_id_idx` ON `users` (`school_id`);--> statement-breakpoint
CREATE INDEX `role_idx` ON `users` (`user_role`);