-- ===========================================================================
-- DISHA Career Lab — WhatsApp agent tables
-- Run once in the Supabase SQL editor of project "disha-career-lab".
-- Creates new objects only; does not touch profiles, reports or payments.
-- Only the edge function (service role) reads/writes these — RLS is on with
-- no public policies, so the site's anon key cannot see any chat.
-- ===========================================================================

create table if not exists public.wa_contacts (
  wa_id         text primary key,            -- WhatsApp number, digits only
  name          text,                        -- WhatsApp profile name
  lang          text default 'en',
  needs_human   boolean default false,       -- asked for a person, not yet answered
  paused_until  timestamptz,                 -- bot stays quiet until then
  day           date,
  day_count     int default 0,
  last_seen     timestamptz default now(),
  created_at    timestamptz default now()
);

create table if not exists public.wa_messages (
  id          bigserial primary key,
  msg_id      text unique,                   -- Meta message id (incoming only) — dedupes retries
  wa_id       text not null,
  direction   text not null check (direction in ('in','out')),
  body        text,
  source      text,                          -- faq:<id> | llm | fallback | human | non-text
  created_at  timestamptz default now()
);

create index if not exists wa_messages_chat_idx on public.wa_messages (wa_id, created_at desc);

alter table public.wa_contacts enable row level security;
alter table public.wa_messages enable row level security;

-- Inbox for the team: chats waiting for a person, newest first.
create or replace view public.wa_handoffs as
  select c.wa_id, c.name, c.lang, c.last_seen,
         (select body from public.wa_messages m
           where m.wa_id = c.wa_id and m.direction = 'in'
           order by created_at desc limit 1) as last_message
    from public.wa_contacts c
   where c.needs_human
   order by c.last_seen desc;

revoke all on public.wa_handoffs from anon, authenticated;

-- Optional retention: keep 180 days of chat text.
-- delete from public.wa_messages where created_at < now() - interval '180 days';
