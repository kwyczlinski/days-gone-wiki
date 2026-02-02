drop table if exists comment;
drop table if exists wiki_user;

create table wiki_user (
    id_user serial primary key,
    username varchar(16) not null,
    email varchar(256) not null unique,
    password_hash text not null,
    rank varchar(16) default 'user'
);

create table comment (
    id_comment serial primary key,
    id_user int not null references wiki_user(id_user) on delete cascade,
    category varchar(20),
    item_id int,
    content text,
    posted timestamp default current_timestamp,
    edited boolean default false
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
  register_user(p_username varchar(16), p_email varchar(256), p_password_hash text)
  language plpgsql
  as $$
  begin
    insert into wiki_user (username, email, password_hash) 
      values (p_username, p_email, p_password_hash); 
  end;
$$;

-- Służy do wyciągania danych o użytkowniku po emailu
create or replace function get_user_by_email(p_email varchar)
returns setof wiki_user
language sql 
as $$
  select * from wiki_user where email = p_email;
$$;

-- Służy do wyciągania danych o użytkowniku po id
create or replace function get_user_by_id(p_id_user int)
returns setof wiki_user
language sql
as $$
  select * from wiki_user where id_user = p_id_user;
$$;

-- Służy do aktualizacji danych użytkownika
create or replace function update_user_profile(p_id_user int, p_username varchar(16), p_email varchar(256))
returns setof wiki_user
language plpgsql
as $$
begin
    return query
    update wiki_user set username = p_username, email = p_email
    where id_user = p_id_user
    returning *;
end;
$$;

-- Służy do usuwania danych użytkownika
create or replace procedure delete_user(p_id_user int)
language sql
as $$
    delete from wiki_user where id_user = p_id_user;
$$;

-- służy do dodawania komentarzy
create or replace procedure add_comment(p_user_id int, p_content text, p_category varchar, p_item_id int)
  language plpgsql
  as $$
  begin
    insert into comment (id_user, category, item_id, content) 
      values (p_user_id, p_category, p_item_id, p_content); 
  end;
$$;

-- służy do wyciągania komentarzy
create or replace function get_comments(p_category varchar, p_item_id int)
returns json
language plpgsql
as $$
declare v_comments json;
begin
    select 
      json_agg(json_build_object('id', c.id_comment,'user_id', c.id_user, 'username', u.username,'content', c.content,'posted', c.posted,'edited', c.edited))
      into v_comments
    from comment c 
    join wiki_user u on c.id_user = u.id_user
    where c.category = p_category and c.item_id = p_item_id;
    return coalesce(v_comments, '[]'::json);
end;
$$;

-- służy do modyfikowania komentarzy
create or replace procedure update_comment(p_comment_id int, p_content text, p_user_id int)
language plpgsql
as $$
begin
    update comment
    set content = p_content, edited = true, posted = current_timestamp
    where id_comment = p_comment_id and id_user = p_user_id;
end;
$$;

-- służy do usuwania komentarzy
create or replace procedure delete_comment(p_comment_id int, p_user_id int)
language plpgsql
as $$
begin
    delete from comment c where c.id_comment = p_comment_id  and c.id_user = p_user_id;
end;
$$;

-- służy do pobrania konkretnego komentarza
create or replace function get_comment(p_comment_id int)
returns setof comment
  language plpgsql
  as $$
  begin
    return query
    select * from comment c where c.id_comment = p_comment_id;
  end;
$$;
