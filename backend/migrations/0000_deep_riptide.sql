CREATE TABLE `users` (
	`id` varchar(128) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stories` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`title` varchar(128) NOT NULL,
	`script` varchar(10000) NOT NULL,
	`context` text,
	`meta` json,
	`step` enum('initial','segment','video','completed') NOT NULL DEFAULT 'initial',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `segments` (
	`id` varchar(128) NOT NULL,
	`story_id` varchar(128) NOT NULL,
	`order` int NOT NULL DEFAULT 0,
	`text` text NOT NULL,
	`prompt` text,
	`image_url` text,
	`status` enum('pending','failed','completed') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `segments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`story_id` varchar(128) NOT NULL,
	`url` text,
	`status` enum('pending','failed','completed') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `videos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `stories` ADD CONSTRAINT `stories_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `segments` ADD CONSTRAINT `segments_story_id_stories_id_fk` FOREIGN KEY (`story_id`) REFERENCES `stories`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `videos` ADD CONSTRAINT `videos_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `videos` ADD CONSTRAINT `videos_story_id_stories_id_fk` FOREIGN KEY (`story_id`) REFERENCES `stories`(`id`) ON DELETE cascade ON UPDATE no action;