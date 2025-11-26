# Database Migrations

This directory contains database migrations for the LeanFuel app. Each migration is split into small, atomic files for easy rollback and maintenance.

## Migration Structure

Each migration consists of two files:
- `XXX_migration_name.sql` - The forward migration
- `XXX_rollback.sql` - The rollback script

## Running Migrations

### Run All Migrations (in order)
```bash
# In Supabase SQL Editor, run in this order:
001_add_onboarding_columns.sql
002_create_weight_logs.sql
003_add_weight_logs_rls.sql
004_create_tdee_function.sql
005_create_macro_function.sql
006_create_complete_onboarding.sql
007_create_helper_functions.sql
```

### Rollback Migrations (reverse order)
```bash
# Run rollbacks in REVERSE order:
007_rollback.sql
006_rollback.sql
005_rollback.sql
004_rollback.sql
003_rollback.sql
002_rollback.sql
001_rollback.sql
```

## Migration List

### 001: Add Onboarding Columns
- Adds all onboarding fields to `profiles` table
- Fields: goal, activity_level, age, gender, weight, height, etc.

### 002: Create Weight Logs Table
- Creates `weight_logs` table for progress tracking
- Includes indexes for performance

### 003: Add Weight Logs RLS
- Enables Row Level Security on `weight_logs`
- Users can only access their own data

### 004: Create TDEE Function
- Function to calculate BMR and TDEE
- Uses Mifflin-St Jeor equation

### 005: Create Macro Function
- Evidence-based macro calculation
- Protein: 1.6-2.2 g/kg
- Fat: 0.9 g/kg or 25% of calories
- Carbs: Fill remaining

### 006: Create Complete Onboarding
- Atomic function to save all onboarding data
- Calculates and saves nutrition goals
- Creates initial weight log

### 007: Create Helper Functions
- `get_nutrition_goals()` - Fetch user goals

## Verification

After running migrations, verify with:

```sql
-- Check columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('goal', 'activity_level', 'age', 'gender', 'current_weight');

-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'weight_logs';

-- Check functions
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('calculate_tdee', 'calculate_macro_goals', 'complete_onboarding');
```

## Best Practices

1. **Always run migrations in order** (001, 002, 003, etc.)
2. **Test rollbacks** in development before production
3. **Backup database** before running migrations
4. **Run one migration at a time** to catch errors early
5. **Verify each migration** before proceeding to next

## Rollback Strategy

If a migration fails:
1. Run the corresponding rollback file
2. Fix the issue in the migration file
3. Re-run the migration
4. Continue with remaining migrations
