CREATE TABLE `boats` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`capacity` integer NOT NULL,
	`description` text,
	`photo_urls` text DEFAULT '[]' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`pricing` text DEFAULT '{}' NOT NULL,
	`features` text DEFAULT '[]' NOT NULL,
	`created_at` text DEFAULT '2026-08-20T22:09:58.295Z' NOT NULL,
	`updated_at` text DEFAULT '2026-08-20T22:09:58.295Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`boat_id` text NOT NULL,
	`customer_id` text,
	`crew_ids` text DEFAULT '[]' NOT NULL,
	`status` text NOT NULL,
	`start_at` text NOT NULL,
	`end_at` text NOT NULL,
	`total_price` real,
	`notes` text,
	`created_by` text,
	`created_at` text DEFAULT '2026-08-20T22:09:58.297Z' NOT NULL,
	`updated_at` text DEFAULT '2026-08-20T22:09:58.297Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `crew_members` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`user_id` text,
	`boat_ids` text DEFAULT '[]' NOT NULL,
	`role` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT '2026-08-20T22:09:58.299Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	`document` text,
	`notes` text,
	`created_at` text DEFAULT '2026-08-20T22:09:58.301Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text NOT NULL,
	`booking_id` text,
	`amount` real NOT NULL,
	`status` text NOT NULL,
	`method` text NOT NULL,
	`paid_at` text,
	`due_at` text NOT NULL,
	`notes` text,
	`created_at` text DEFAULT '2026-08-20T22:09:58.303Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tenants` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`domain` text,
	`is_active` integer DEFAULT true NOT NULL,
	`features` text DEFAULT '{}' NOT NULL,
	`branding` text DEFAULT '{}' NOT NULL,
	`created_at` text DEFAULT '2026-08-20T22:09:58.290Z' NOT NULL,
	`updated_at` text DEFAULT '2026-08-20T22:09:58.290Z' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tenants_slug_unique` ON `tenants` (`slug`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text NOT NULL,
	`tenant_id` text NOT NULL,
	`role` text DEFAULT 'owner' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT '2026-08-20T22:09:58.293Z' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);