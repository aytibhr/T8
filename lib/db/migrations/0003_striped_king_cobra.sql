CREATE TABLE "leaderboard" (
	"id" serial PRIMARY KEY NOT NULL,
	"rank" integer NOT NULL,
	"player_name" varchar(100) NOT NULL,
	"gamer_tag" varchar(100) NOT NULL,
	"game_name" varchar(100) NOT NULL,
	"score" integer NOT NULL,
	"points_type" varchar(50) DEFAULT 'XP' NOT NULL,
	"formatted_score" varchar(50) NOT NULL,
	"platform" varchar(50) NOT NULL,
	"rank_tier" varchar(50) DEFAULT 'Gold' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "user_phone" varchar(20);--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "customer_name" varchar(100);