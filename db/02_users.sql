drop table if exists comment;
drop table if exists wiki_user;

create table wiki_user (
    id_user serial primary key,
    username varchar(16) not null,
    email varchar(256) not null unique,
    password_hash varchar(256) not null
);

create table comment (
    id_comment serial primary key,
    user_id int not null references wiki_user(id_user),
    posted timestamp default current_timestamp,
    content text
);

-- Służy do weryfikacji czy email jest zajęty
create or replace function is_email_used(p_email varchar(256))
returns boolean
language sql 
as $$
  select exists (
    select 1 
    from wiki_user 
    where email = p_email
  );
$$;

-- Służy do dodawania użytkowników do bazy
create or replace procedure
  register_user(p_username varchar(16), p_email varchar(256), p_password_hash varchar(256))
  language plpgsql
  as $$
  begin
    insert into wiki_user (username, email, password_hash) 
      values (p_username, p_email, p_password_hash); 
  end;
$$;