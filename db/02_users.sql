drop table if exists comment;
drop table if exists wiki_user;

create table wiki_user (
    id_user serial primary key,
    username varchar(16) not null,
    email varchar(256) not null unique,
    password_hash text not null,
    deleted boolean default false,
    rank varchar(16) default 'user'
);

create table comment (
    id_comment serial primary key,
    id_user int not null references wiki_user(id_user),
    category varchar(20),
    entity_id int,
    content text,
    created timestamp default current_timestamp,
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

-- służy do wyciągania danych o użytkowniku po emailu
create or replace function get_user_by_email(p_email varchar(256))
returns setof wiki_user
language sql 
as $$
  select *
    from wiki_user 
    where email = p_email;
$$;

-- służy do dodawania komentarzy
create or replace procedure add_comment(p_user_id int, p_content text, p_category varchar, p_entity_id int)
  language plpgsql
  as $$
  begin
    insert into comment (id_user, category, entity_id, content) 
      values (p_user_id, p_category, p_entity_id, p_content); 
  end;
$$;

-- służy do wyciągania komentarzy
create or replace function get_comments(p_category varchar, p_entity_id int)
returns json
language plpgsql
as $$
declare v_comments json;
begin
    select 
      json_agg(json_build_object('id', c.id_comment,'user_id', c.id_user,'content', c.content,'posted', c.posted,'edited', c.edited))
      into v_comments
    from comment c where c.category = p_category and c.entity_id = p_entity_id;
    return coalesce(v_comments, '[]'::json);
end;
$$;

-- służy do modyfikowania komentarzy
create or replace function update_comment(p_comment_id int, p_content text, p_user_id int)
returns setof comment
  language plpgsql
  as $$
  begin
    return query
    update comment c set c.content = p_content, c.edited = true, c.created = current_timestamp
    where c.id_comment = p_comment_id and c.id_user = p_user_id
    returning *;
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
