-- Run this in your Supabase SQL editor (Dashboard > SQL Editor > New Query)

-- 1. Create the quiz_results table
create table quiz_results (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  email text not null,
  name text not null,
  top_5 jsonb not null,
  rankings jsonb not null,
  domain_scores jsonb not null
);

-- 2. Enable Row Level Security
alter table quiz_results enable row level security;

-- 3. Allow anyone to INSERT (quiz takers don't need to be logged in)
create policy "Anyone can insert quiz results"
  on quiz_results for insert
  with check (true);

-- 4. Only authenticated users (admin) can SELECT
create policy "Authenticated users can read all results"
  on quiz_results for select
  using (auth.role() = 'authenticated');

-- 5. Create an index on email for faster lookups
create index idx_quiz_results_email on quiz_results (email);

-- 6. Create an index on created_at for sorting
create index idx_quiz_results_created_at on quiz_results (created_at desc);
