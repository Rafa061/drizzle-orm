DO $$ BEGIN
 CREATE TYPE "status" AS ENUM('active', 'inactive');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"price" numeric,
	"status" "status" DEFAULT 'active',
	CONSTRAINT "products_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"quantity" integer,
	"total" numeric,
	"status" "status" DEFAULT 'active',
	"created_at" integer,
	"updated_at" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sales_detail" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer,
	"quantity" integer,
	"total" numeric,
	"status" "status" DEFAULT 'active',
	"sale_id" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_detail" ADD CONSTRAINT "sales_detail_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sales_detail" ADD CONSTRAINT "sales_detail_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE no action ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
