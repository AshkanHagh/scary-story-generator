CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`is_anonymous` boolean NOT NULL DEFAULT false,
	`token` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(128) NOT NULL,
	`script` varchar(10000) NOT NULL,
	`context` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `segments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`story_id` int NOT NULL,
	`order` int NOT NULL DEFAULT 0,
	`text` text NOT NULL,
	`prompt` text,
	`image_id` text,
	`voice_id` text,
	`image_url` text,
	`status_enum` enum('pending','failed','completed') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `segments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`story_id` int NOT NULL,
	`url` text,
	`video_status` enum('pending','failed','completed') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `videos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `stories` ADD CONSTRAINT `stories_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `segments` ADD CONSTRAINT `segments_story_id_stories_id_fk` FOREIGN KEY (`story_id`) REFERENCES `stories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `videos` ADD CONSTRAINT `videos_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `videos` ADD CONSTRAINT `videos_story_id_stories_id_fk` FOREIGN KEY (`story_id`) REFERENCES `stories`(`id`) ON DELETE no action ON UPDATE no action;