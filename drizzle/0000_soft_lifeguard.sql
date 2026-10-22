CREATE TABLE `admins` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text NOT NULL,
	`password_hash` text NOT NULL,
	`role` text DEFAULT 'agent' NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`token_version` integer DEFAULT 0 NOT NULL,
	`last_login_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admins_email_idx` ON `admins` (`email`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`admin_id` text,
	`action` text NOT NULL,
	`entity` text,
	`entity_id` text,
	`detail` text,
	`ip` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `audit_created_idx` ON `audit_log` (`created_at`);--> statement-breakpoint
CREATE TABLE `complaints` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`customer_id` text,
	`request_id` text,
	`full_name` text NOT NULL,
	`phone` text NOT NULL,
	`category` text NOT NULL,
	`subject` text NOT NULL,
	`description` text NOT NULL,
	`preferred_contact_time` text,
	`status` text DEFAULT 'open' NOT NULL,
	`priority` text DEFAULT 'normal' NOT NULL,
	`resolution` text,
	`resolved_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`request_id`) REFERENCES `requests`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `complaints_reference_idx` ON `complaints` (`reference`);--> statement-breakpoint
CREATE INDEX `complaints_status_idx` ON `complaints` (`status`);--> statement-breakpoint
CREATE TABLE `content_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`title` text,
	`subtitle` text,
	`body` text,
	`meta_json` text,
	`is_visible` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `content_blocks_kind_idx` ON `content_blocks` (`kind`);--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`full_name` text NOT NULL,
	`phone` text NOT NULL,
	`alt_phone` text,
	`email` text,
	`area` text,
	`landmark` text,
	`plan_id` text,
	`account_number` text,
	`install_date` text,
	`monthly_price` integer,
	`status` text DEFAULT 'active' NOT NULL,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customers_phone_idx` ON `customers` (`phone`);--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text,
	`request_id` text,
	`complaint_id` text,
	`direction` text NOT NULL,
	`channel` text DEFAULT 'whatsapp' NOT NULL,
	`body` text NOT NULL,
	`template_key` text,
	`to_phone` text NOT NULL,
	`admin_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`request_id`) REFERENCES `requests`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`complaint_id`) REFERENCES `complaints`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `messages_customer_idx` ON `messages` (`customer_id`);--> statement-breakpoint
CREATE TABLE `plans` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`speed_mbps` integer NOT NULL,
	`monthly_price` integer NOT NULL,
	`price_override` integer,
	`is_custom` integer DEFAULT 0 NOT NULL,
	`tagline` text,
	`description` text,
	`icon` text DEFAULT 'plug' NOT NULL,
	`badge` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `plans_slug_idx` ON `plans` (`slug`);--> statement-breakpoint
CREATE INDEX `plans_active_idx` ON `plans` (`is_active`);--> statement-breakpoint
CREATE TABLE `referral_awards` (
	`id` text PRIMARY KEY NOT NULL,
	`referrer_phone` text NOT NULL,
	`referrer_name` text,
	`customer_id` text,
	`successful_referrals` integer DEFAULT 0 NOT NULL,
	`days_granted` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`granted_at` text,
	`notes` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `referral_awards_phone_idx` ON `referral_awards` (`referrer_phone`);--> statement-breakpoint
CREATE TABLE `requests` (
	`id` text PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`full_name` text NOT NULL,
	`phone` text NOT NULL,
	`alt_phone` text,
	`email` text,
	`area` text NOT NULL,
	`county` text,
	`landmark` text,
	`plan_id` text NOT NULL,
	`plan_name_snapshot` text NOT NULL,
	`speed_mbps_snapshot` integer NOT NULL,
	`price_snapshot` integer NOT NULL,
	`installation_fee_accepted` integer DEFAULT 0 NOT NULL,
	`installation_fee_amount` integer,
	`terms_accepted` integer DEFAULT 0 NOT NULL,
	`preferred_contact_time` text,
	`preferred_install_date` text,
	`referral_code` text,
	`referrer_phone` text,
	`notes` text,
	`source` text DEFAULT 'web' NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`whatsapp_sent` integer DEFAULT 0 NOT NULL,
	`whatsapp_sent_at` text,
	`admin_notes` text,
	`customer_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`plan_id`) REFERENCES `plans`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `requests_reference_idx` ON `requests` (`reference`);--> statement-breakpoint
CREATE INDEX `requests_status_idx` ON `requests` (`status`);--> statement-breakpoint
CREATE INDEX `requests_phone_idx` ON `requests` (`phone`);--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
