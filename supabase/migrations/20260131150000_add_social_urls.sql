alter table profiles
add column if not exists github_url text,
add column if not exists linkedin_url text,
add column if not exists leetcode_url text;
