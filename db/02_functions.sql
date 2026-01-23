-- Procedura 
-- Służy do dodawania misji do bazy danych, jest bardziej intuicyjna i wygodniejsza w obsłudze ponieważ przyjmuje fragmenty nazwy obozu, i fragmenty nazwy regionu, dzięki czemu nie trzeba pamiętać id. Dodatkowo pilnuje aby nazwa misji składała się ze słów zaczynających się wielką literą. 
-- Liczba obozów i regionów w grze jest niewielka, a nazwy mają zrożnicowane, więc błąd jest mało prawdopodobny. Dodatkowo jest notice dla upewnienia.
create or replace procedure
  add_mission(in_id_mission int, in_region varchar(16), in_reward varchar(12), in_camp varchar(32), in_mission_name varchar(64), in_description text default null, in_main boolean default false, in_start_time time default null)
  language plpgsql
  as $$
  declare 
    var_region int;
    v_region_name varchar(16);
    var_camp int;
    v_camp_name varchar(32);
  begin
  
    select id_region, region_name into var_region, v_region_name
      from region 
      where lower(region_name) like lower('%' ||in_region|| '%') 
      limit 1;
    if not found then
      raise exception 'region "%" not found', in_region::text;
    end if;
    
    select id_camp, camp_name into var_camp, v_camp_name
      from camp 
      where lower(camp_name) like lower('%' ||in_camp|| '%') 
      limit 1;
    if not found then
      raise exception 'camp "%" not found', in_camp;
    end if;
    
    perform 1 
      from reward 
      where id_reward = in_reward;
    if not found and in_reward is not null then
      raise exception 'no reward id "%" found', in_reward::text;
    end if;
    
    raise notice 'region "%" and camp "%" found', v_region_name, v_camp_name;
    
    insert into mission (id_mission, region, reward, camp, mission_name, main, start_time, description) 
      values (in_id_mission, var_region, in_reward, var_camp, initcap(in_mission_name), in_main, in_start_time, in_description); 
  end;
$$;

-- poprawne użycie
-- call add_mission(41, 'lost', '40400400', 'iron','I need your help','Ride to meet with O''Brian.', true, '4:47 PM');


-- Funkcja
-- Służy do przeszukiwania bazy danych po nazwach i opisach wybranych elementów, posiada system wag, który mógłby zależeć od zmiennych w zależności od kontekstu.
-- Posiada również ograniczenie ilości wyników do przystępnej liczby, dzięki czemu odpowiedź nie odbiega za bardzo od pytania.
-- Działa również w taki sposób aby nie było duplikatów, wynikających z np. camp.camp_name i camp.description.
create or replace function search(key varchar(64)) returns table(name text, category text, id int)
  language sql
  as $$
   
  select name, category, id 
    from (
      select distinct on (name, category, id) name, category, id, weight 
        from (
  	  (select mission_name as name, 'mission' as category, id_mission as id, 2 as weight 
      	    from mission 
      	    where lower(mission_name) like lower('%'||key||'%') 
    	    limit 3)
	  union all
	  (select horde_name as name, 'horde' as category, id_horde as id, 2 as weight 
    	    from horde 
    	    where lower(horde_name) like lower('%'||key||'%') 
    	    limit 3)
  	  union all
  	  (select infestation_name as name, 'infestation' as category, id_infestation as id, 1 as weight 
    	    from infestation 
    	    where lower(infestation_name) like lower('%'||key||'%') 
    	    limit 3)
  	  union all
  	  (select item as name, 'merchant' as category, id_merchant as id, 3 as weight 
    	    from merchant 
    	    where lower(item) like lower('%'||key||'%')
    	    limit 3)
  	  union all
  	  (select upgrade as name, 'mechanic' as category, id_mechanic as id, 3 as weight 
   	    from mechanic 
  	    where lower(upgrade) like lower('%'||key||'%') 
  	    limit 3)
  	  union all
  	  (select camp_name as name, 'camp' as category, id_camp as id, 1 as weight 
  	    from camp 
  	    where lower(camp_name) like lower('%'||key||'%') 
  	    limit 3)
  	  union all
  	  (select collectible_name as name, 'collectible' as category, id_collectible as id, 4 as weight 
  	    from collectible 
  	    where lower(collectible_name) like lower('%'||key||'%') 
  	    limit 3)
  	  union all
  	  (select mission_name as name, 'mission' as category, id_mission as id, 10 as weight 
  	    from mission 
  	    where lower(description) like lower('%'||key||'%') 
  	    limit 10)
  	  union all
  	  (select collectible_name as name, 'collectible' as category, id_collectible as id, 10 as weight 
  	    from collectible
  	    where lower(description) like lower('%'||key||'%') 
  	    limit 10)
  	  union all
  	  (select upgrade as name, 'mechanic' as category, id_mechanic as id, 10 as weight 
  	    from mechanic 
  	    where lower(description) like lower('%'||key||'%') 
  	    limit 10)
  	  union all
  	  (select camp_name as name, 'camp' as category, id_camp as id, 15 as weight 
  	    from camp 
  	    where lower(description) like lower('%'||key||'%') 
  	    limit 6)
        ) as all_results
        order by name, category, id, weight
      ) as disinct_results
      order by weight asc
      limit 10
  $$;

-- poprawne użycie
-- select * from search('camp');


-- Widok
-- Ogląd sumy nagród za misję główne, jeżeli uruchomiony przed przykładem użycia procedury to, po użyciu procedury, można zauważyć zmianę w wartościach widoku.
create view main_rewards as
  select c.camp_name camp, sum(r.trust) trust, sum(r.credits) credits 
    from mission m 
    join reward r on m.reward = r.id_reward 
    join camp c on m.camp = c.id_camp 
    where m.main = true 
    group by c.camp_name;

-- poprawne użycie
-- select * from main_rewards;


-- Wyzwalacz 1
-- Umożliwia usunięcia wpisu misji poprzez usunięcie zależnych wpisów w tablicy mission_order
create or replace function del_mission() returns trigger as $del_mission$
  begin
    raise notice 'deleting % rows from mission_order', (select count(*) from mission_order where previous_mission = old.id_mission or next_mission = old.id_mission);
    delete from mission_order 
      where previous_mission = old.id_mission or next_mission = old.id_mission;
    return old;
  end;
$del_mission$ language plpgsql;

create trigger del_mission before delete on mission
  for each row execute function del_mission();

-- poprawne użycie
-- delete from mission where id_mission = 41;


-- Wyzwalacz 2
-- Usuwa nieużywane wpisy nagród, z powodu założeń/ograniczeń sql powinien zostać utworzony dla każdej tabeli zawierającej id nagród (mission, horde, infestation)
create or replace function unused_reward() returns trigger as $unused_reward$
  begin
    if old.reward is not null then
      perform reward 
  	from horde
  	full join infestation using(reward)
  	full join mission using(reward)
  	where reward = old.reward
        group by reward;
      if not found then
        delete from reward
          where id_reward = old.reward;
          raise notice 'po';
      end if;
    end if;
    return old;
  end;
$unused_reward$ language plpgsql;

create trigger unused_reward after delete on mission
  for each row execute function unused_reward();

-- poprawne użycie
-- delete from mission where reward = '40400400';

-- Testowanie działania:
-- 1. Dodanie pomocniczego wiersza
-- insert into reward values('40400400', 4000, 4000, 4000);
-- 2. Zobaczenie widoku przed dodaniem misji
-- 3. Dodanie misji procedurą
-- 4. Porównanie widoku po dodaniu misji
-- 5. Dodanie pomocniczego wiersza
-- insert into mission_order(previous_mission, next_mission) values(39,41);
-- 6. Usunięcie misji dowolnym przykładem z wyzwalaczy
-- 7. Sprawdzenie, że zarówno misja została usunięta poprawnie, jak i wiersz z tabeli reward z pkt. 1 oraz wiersz z tabeli mission_order z pkt. 5

-- Służy do pobierania strony wiki dla znajdźki
create or replace function get_collectible_page(p_id_collectible int)
returns table(
    collectible_id int,
    collectible_name varchar,
    description text,
    region_name varchar,
    region_id int
) 
language sql 
as $$
  select 
  c.id_collectible,
    c.collectible_name, 
    c.description, 
    r.region_name, 
    r.id_region
  from collectible c 
  join region r on c.region = r.id_region
  where c.id_collectible = p_id_collectible;
$$;