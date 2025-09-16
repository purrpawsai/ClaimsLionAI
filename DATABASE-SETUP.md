# Database Setup Guide

This guide will help you ensure your Supabase database tables match the expected schema for RetailLionAI.

## Quick Verification Steps

### 1. Check Current Tables

Run this SQL in your Supabase SQL Editor to see what you currently have:

```sql
-- Copy and paste this into your Supabase SQL Editor
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name IN ('analysis_results', 'recommended_actions', 'chat_messages', 'analysis_chunks')
ORDER BY table_name, ordinal_position;
```

### 2. Expected Table Structure

Your tables should have this exact structure:

#### `analysis_results`
- `id` (UUID, Primary Key, Default: gen_random_uuid())
- `filename` (TEXT, NOT NULL)
- `file_url` (TEXT, NOT NULL)
- `json_response` (JSONB, NOT NULL)
- `created_at` (TIMESTAMP, NOT NULL, Default: NOW())

#### `recommended_actions`
- `id` (UUID, Primary Key, Default: gen_random_uuid())
- `analysis_id` (UUID, NOT NULL, Foreign Key to analysis_results.id)
- `priority` (TEXT, NULLABLE)
- `action` (TEXT, NULLABLE)
- `product` (TEXT, NULLABLE)
- `impact` (TEXT, NULLABLE)
- `timeline` (TEXT, NULLABLE)
- `move_from` (TEXT, NULLABLE)
- `move_to` (TEXT, NULLABLE)
- `quantity_to_move` (INTEGER, NULLABLE)
- `sku` (TEXT, NULLABLE)
- `expiry_date` (TEXT, NULLABLE)
- `created_at` (TIMESTAMP, NOT NULL, Default: NOW())

#### `chat_messages`
- `id` (UUID, Primary Key, Default: gen_random_uuid())
- `analysis_id` (UUID, NOT NULL, Foreign Key to analysis_results.id, ON DELETE CASCADE)
- `role` (TEXT, NOT NULL)
- `content` (TEXT, NOT NULL)
- `created_at` (TIMESTAMP, NOT NULL, Default: NOW())

#### `analysis_chunks`
- `id` (UUID, Primary Key, Default: gen_random_uuid())
- `analysis_id` (UUID, NOT NULL, Foreign Key to analysis_results.id, ON DELETE CASCADE)
- `chunk_index` (INTEGER, NOT NULL)
- `total_chunks` (INTEGER, NOT NULL)
- `json_response` (JSONB, NOT NULL)
- `processed` (BOOLEAN, NOT NULL, Default: false)
- `created_at` (TIMESTAMP, NOT NULL, Default: NOW())

## Setup Methods

### Method 1: SQL Script (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `scripts/setup-database.sql`
4. Run the script

This will:
- Create any missing tables
- Add any missing columns
- Create necessary indexes
- Show you the final table structure

### Method 2: Drizzle Migrations

If you prefer using Drizzle migrations:

```bash
# Install dependencies
npm install

# Set up environment variables
export SUPABASE_DATABASE_URL="your_supabase_database_url"

# Push the schema
npm run db:push
```

### Method 3: Manual Verification Script

```bash
# Install dependencies
npm install

# Set up environment variables
export SUPABASE_URL="your_supabase_url"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
export SUPABASE_DATABASE_URL="your_database_url"

# Run verification
npm run db:verify
```

## Environment Variables

Make sure you have these environment variables set:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

## Common Issues

### Issue 1: Tables Don't Exist
**Solution**: Run the `setup-database.sql` script

### Issue 2: Missing Columns
**Solution**: The SQL script will automatically add missing columns

### Issue 3: Wrong Data Types
**Solution**: You may need to manually alter columns or recreate tables

### Issue 4: Foreign Key Constraints Missing
**Solution**: The SQL script includes proper foreign key relationships

## Verification Checklist

- [ ] All 4 tables exist: `analysis_results`, `recommended_actions`, `chat_messages`, `analysis_chunks`
- [ ] All columns have correct data types
- [ ] Primary keys are UUID with gen_random_uuid() default
- [ ] Foreign key relationships are properly set up
- [ ] Timestamps have NOW() default
- [ ] Boolean fields have appropriate defaults
- [ ] Indexes are created for performance

## Testing the Setup

After setup, you can test with a simple query:

```sql
-- Test insert into analysis_results
INSERT INTO analysis_results (filename, file_url, json_response) 
VALUES ('test.csv', 'https://example.com/test.csv', '{"test": "data"}');

-- Test select
SELECT * FROM analysis_results;

-- Clean up test data
DELETE FROM analysis_results WHERE filename = 'test.csv';
```

## Storage Setup

Don't forget to set up Supabase Storage:

1. Go to Storage in your Supabase Dashboard
2. Create a new bucket called `uploads`
3. Set the bucket to public
4. Configure RLS policies as needed

## Support

If you encounter issues:

1. Check the Supabase logs in your dashboard
2. Verify your environment variables
3. Ensure you have the correct permissions
4. Check the table structure matches exactly 