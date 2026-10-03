CREATE TABLE `copies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title_id` integer NOT NULL,
	`owner_name` text NOT NULL,
	`location` text DEFAULT 'הבית המשותף' NOT NULL,
	`status` text DEFAULT 'available' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`title_id`) REFERENCES `titles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `family_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`color` text DEFAULT '#244d3e' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `loans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`copy_id` integer NOT NULL,
	`borrower_name` text NOT NULL,
	`loaned_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`returned_at` text,
	FOREIGN KEY (`copy_id`) REFERENCES `copies`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title_id` integer NOT NULL,
	`member_name` text NOT NULL,
	`rating` integer NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`title_id`) REFERENCES `titles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `titles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`author` text NOT NULL,
	`genre` text DEFAULT 'לא מסווג' NOT NULL,
	`language` text DEFAULT 'he' NOT NULL,
	`isbn` text,
	`cover_key` text,
	`rating` real DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wishlist` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`requested_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
