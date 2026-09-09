CREATE TABLE `species` (
	`id` text PRIMARY KEY NOT NULL,
	`common_name` text NOT NULL,
	`scientific_name` text NOT NULL,
	`description` text,
	`conservation_status` text NOT NULL,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`photo_local_uri` text,
	`photo_remote_url` text,
	`author_id` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`sync_status` text DEFAULT 'pending' NOT NULL,
	`last_sync_error` text,
	`deleted_at` integer
);
--> statement-breakpoint
CREATE INDEX `species_sync_status_idx` ON `species` (`sync_status`);--> statement-breakpoint
CREATE INDEX `species_deleted_at_idx` ON `species` (`deleted_at`);--> statement-breakpoint
CREATE TABLE `sync_queue` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`operation` text NOT NULL,
	`payload` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`created_at` integer DEFAULT (unixepoch() * 1000) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `sync_queue_entity_idx` ON `sync_queue` (`entity_type`,`entity_id`);