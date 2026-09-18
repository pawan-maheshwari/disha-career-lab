-- ===========================================================================
-- DISHA Career Lab — webinar booking tables
-- Run once in the Supabase SQL editor of project "disha-career-lab".
-- Safe to run on the live project: it creates new objects only and does not
-- touch profiles, reports or payments.
-- ===========================================================================

-- 1. Registrations ----------------------------------------------------------
create table if not exists public.webinar_registrations (
  id            bigserial primary key,
  receipt_no    text unique not null,
  webinar       text not null check (webinar in ('career','ai')),
  session_date  date not null,
  session_time  text,
  name          text not null,
  email         text not null,
  mobile        text not null,
  klass         text,
  city          text,
  amount        numeric(10,2) not null default 0,
  currency      text default 'INR',
  method        text,
  reference     text,
  zoom_link     text,
  status        text default 'paid-claimed',
  created_at    timestamptz default now()
);

create index if not exists webinar_reg_session_idx
  on public.webinar_registrations (webinar, session_date);

-- 2. Public seat tally ------------------------------------------------------
-- Anyone may read this; nobody may read the registrations themselves.
create table if not exists public.webinar_seats (
  session_key text primary key,      -- e.g. 'career-2026-09-19'
  booked      integer not null default 0,
  updated_at  timestamptz default now()
);

create or replace function public.webinar_bump_seat()
returns trigger language plpgsql security definer as $$
begin
  insert into public.webinar_seats (session_key, booked, updated_at)
  values (new.webinar || '-' || to_char(new.session_date,'YYYY-MM-DD'), 1, now())
  on conflict (session_key)
  do update set booked = public.webinar_seats.booked + 1, updated_at = now();
  return new;
end $$;

drop trigger if exists webinar_seat_trigger on public.webinar_registrations;
create trigger webinar_seat_trigger
  after insert on public.webinar_registrations
  for each row execute function public.webinar_bump_seat();

-- 3. Row-level security -----------------------------------------------------
alter table public.webinar_registrations enable row level security;
alter table public.webinar_seats         enable row level security;

-- Webinars are open to all with no login, so an anonymous visitor may book…
drop policy if exists webinar_anon_insert on public.webinar_registrations;
create policy webinar_anon_insert
  on public.webinar_registrations for insert to anon, authenticated
  with check (true);

-- …but only the admin account may read the register.
drop policy if exists webinar_admin_read on public.webinar_registrations;
create policy webinar_admin_read
  on public.webinar_registrations for select to authenticated
  using (auth.jwt() ->> 'email' = 'maheshwari1382@gmail.com');

drop policy if exists webinar_seats_read on public.webinar_seats;
create policy webinar_seats_read
  on public.webinar_seats for select to anon, authenticated
  using (true);

-- 4. Optional: Zoom links held server-side ---------------------------------
-- The app reads links from the admin panel (this browser). If you would
-- rather store them centrally, create this table and read it in the module.
create table if not exists public.webinar_sessions (
  session_key text primary key,
  webinar     text not null,
  session_date date not null,
  zoom_link   text,
  seat_cap    integer default 100,
  updated_at  timestamptz default now()
);
alter table public.webinar_sessions enable row level security;
drop policy if exists webinar_sessions_read on public.webinar_sessions;
create policy webinar_sessions_read
  on public.webinar_sessions for select to anon, authenticated using (true);
