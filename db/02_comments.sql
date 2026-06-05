DROP PROCEDURE IF EXISTS add_comment(character varying,character varying,text,character varying,integer);
DROP FUNCTION IF EXISTS get_comments(character varying, integer);
DROP PROCEDURE IF EXISTS update_comment(integer, text, character varying);
DROP PROCEDURE IF EXISTS delete_comment(integer, character varying);
DROP FUNCTION IF EXISTS get_comment(integer);

drop table if exists comment;

create table comment (
    id_comment serial primary key,
    id_user varchar(64) not null,
    username varchar(64) not null,
    category varchar(20),
    item_id int,
    content text,
    posted timestamp default current_timestamp,
    edited boolean default false
);

-- służy do dodawania komentarzy
create or replace procedure add_comment(p_user_id varchar, p_username varchar, p_content text, p_category varchar, p_item_id int)
  language plpgsql
  as $$
  begin
    insert into comment (id_user, username, category, item_id, content) 
      values (p_user_id, p_username, p_category, p_item_id, p_content); 
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
      json_agg(json_build_object('id', c.id_comment,'user_id', c.id_user, 'username', c.username,'content', c.content,'posted', c.posted,'edited', c.edited))
      into v_comments
    from comment c
    where c.category = p_category and c.item_id = p_item_id;
    return coalesce(v_comments, '[]'::json);
end;
$$;

-- służy do modyfikowania komentarzy
create or replace procedure update_comment(p_comment_id int, p_content text, p_user_id varchar)
language plpgsql
as $$
begin
    update comment
    set content = p_content, edited = true
    where id_comment = p_comment_id and id_user = p_user_id;
end;
$$;

-- służy do usuwania komentarzy
create or replace procedure delete_comment(p_comment_id int, p_user_id varchar)
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
