create extension if not exists "uuid-ossp";

-- Table to store users
create table if not exists users (
	id serial primary key,
	email varchar(100),
	activated boolean default false,
    refresh_token varchar
);

-- Intialize the boards table.
create table if not exists boards (
	id serial primary key,
	uniq_id uuid,
	created timestamp default now(),
	boardname varchar(32)
);

-- Add a new event at the end of the log of events in a board table.
-- Does not add the event if the event id is already in the table.
-- Returns the offset of the new event.
create or replace function addevent(
	boardid integer, 
	eventid varchar(32),
	eventbody jsonb
	)
returns integer
language plpgsql
as $body$
declare
	offset integer;
	foundId varchar(32);
	findId text;
	insertEvent text;
begin
	findId := format('select eventid from board%s where eventid = %L', boardid, eventid);
	insertEvent := format('insert into board%s (eventid, eventbody) values (%L, %L)', boardid, eventid, eventbody);
	execute findId into foundId;
	if (
		foundId is not null
	) then
		raise info 'event id already exists';
		return null;
	else
		execute insertEvent;
		return currval(format('board%s_logid_seq', boardid));
	end if;
end;
$body$;

create or replace function add_event_using_uuid(
    board_or_edit_link_uuid uuid,
    eventid varchar(32),
    eventbody jsonb
)
returns integer
language plpgsql
as $body$
declare
	board_found_id integer;
begin
	-- First, try to find the board_id using the board UUID
	select id into board_found_id from boards where uniq_id = board_or_edit_link_uuid;

	-- If not found, try finding the board_id using the edit link UUID
	if board_found_id is null then
	    select board_id into board_found_id
	    from board_edit_link bel
	    where bel.edit_link_uuid = board_or_edit_link_uuid;
	end if;

	-- If no board_id was found by now, raise an error
	if board_found_id is null then
	    raise exception 'Board UUID or Edit Link UUID does not exist';
	end if;

	-- Call addevent function with the found board_id
    -- addevent function handles unique eventid checking and other logic
	return addevent(board_found_id, eventid, eventbody);
end;
$body$;

-- A function to list events of a board newer than the offset.
-- Takes an id of a board and an offset
-- Returns a table of ovents
create or replace function listevents(
	board_uuid uuid,
	afterlogid integer
)
returns table (
	logid integer,
	eventid varchar(32),
	eventbody jsonb
)
language plpgsql
as $body$
declare
    board_identifier integer;
	selectevents text;
	link_result record;
begin
    -- First, try to find the board_id using the direct board UUID
    select id into board_identifier from boards where uniq_id = board_uuid;

    -- If not found, use the get_link function to retrieve the board_id using edit or view link UUID
    if board_identifier is null then
        select * into link_result from get_link(board_uuid);
        board_identifier := link_result.board_id; -- Explicitly assign the value from returned record
    end if;

    -- If no board_id was found by now, raise an error
    if board_identifier is null then
        raise exception 'Board UUID or Link UUID does not exist';
    end if;

    -- Prepare the SQL query to select events
    selectevents := format('select * from board%s where logid>=%s order by logid asc', board_identifier, afterlogid);

    -- Execute the prepared SQL query and return the result
    return query execute selectevents;
end;
$body$;


create or replace function selectBoardId(
	uuid uuid
)
returns integer
language plpgsql
as $body$
declare
    boardId integer;
begin
	if ( uuid is null ) then
		raise exception 'board_uuid is null';
	end if;
	select id into boardId from boards where uniq_id = uuid;
	return boardId;
end;
$body$;

create or replace function create_board(
    board_id uuid,
    title varchar(32)
)
returns uuid
language plpgsql
as $$
declare
    new_board_id uuid := board_id; 
    created_board_id integer;
begin
    if (new_board_id is null) then
        new_board_id := uuid_generate_v4();
    end if;

    INSERT INTO boards (uniq_id, boardname)
    VALUES (new_board_id, title)
    RETURNING id INTO created_board_id;

    PERFORM addboardtable(created_board_id);

    return new_board_id;
end;
$$;

create or replace function create_private_board(
    board_id uuid,
    title varchar(32),
    owner_id integer
)
returns uuid
language plpgsql
as $$
declare
	board_uuid uuid := board_id;
	created_board_id integer;
begin
	if (board_uuid is null) then
        board_uuid := uuid_generate_v4();
    end if;
   	perform create_board(board_uuid, title);
    select id into created_board_id from boards where uniq_id = board_uuid;
    
    insert into board_owner ("board_id", owner_id)
    values (created_board_id, owner_id);
    
    insert into board_permissions ("board_id", user_id, can_view, can_edit)
    values (created_board_id, owner_id, true, true);
   
    return board_uuid;
end;
$$;

-- A function to add a new board to the database.
-- Calls addboardrecord to create a new board record and get its id to call addboardtable.
-- Returns the id of the new board record.
create or replace function addboard()
	returns record
	language plpgsql
as
$body$
declare
	rec record;
begin
	select fnc.id, fnc.uniq_id into rec from addboardrecord() fnc;
	perform addboardtable(rec.id);
	RETURN rec;
end;
$body$;

create or replace function delete_board(board_uuid UUID)
returns void
language plpgsql
as $$
begin
    declare
        board_id_to_delete integer;
    begin
        select id into board_id_to_delete from boards where uniq_id = board_uuid;
        
        if not found then
            raise exception 'Board not found with UUID %', board_uuid;
        end if;
        
        delete from board_permissions where board_id = board_id_to_delete;
        delete from board_owner where board_id = board_id_to_delete;
        delete from board_edit_link where board_id = board_id_to_delete;
        delete from board_view_link where board_id = board_id_to_delete;
        delete from board_snapshots where board_id = board_id_to_delete;
        execute format('drop table if exists board%s', board_id_to_delete);
        delete from boards where id = board_id_to_delete;
    end;
end;
$$;

create or replace function duplicate_board(
    original_board_uuid uuid,
    new_board_uuid uuid
)
returns void
language plpgsql
as $$
declare
    original_board_id integer;
    new_board_id integer;
    new_board_record record;
begin
    select id into original_board_id from boards where uniq_id = original_board_uuid;
    if original_board_id is null then
        raise exception 'Original board does not exist';
    end if;
    
    insert into boards (uniq_id, boardname)
    select new_board_uuid, boardname || ' (Copy)' from boards where id = original_board_id
    returning id into new_board_id;
    
    perform addboardtable(new_board_id);
    
    execute format('insert into board%s (eventid, eventbody) select eventid, eventbody from board%s', new_board_id, original_board_id);
end;
$$;

create or replace function rename_board(board_uuid UUID, new_boardname varchar)
returns VOID AS $$
declare
    board_id integer;
begin
    select id into board_id from boards where uniq_id = board_uuid;
    if not found then
        raise exception 'Board not found with UUID %', board_uuid using errcode = 'XXXXX';
    end if;
    update boards set boardname = new_boardname where id = board_id;
end;
$$ language plpgsql;

create or replace function create_link(
    board_uuid uuid,
    link_type varchar,
    link_uuid uuid
)
returns void
language plpgsql
as $$
declare
    board_id integer;
begin
    select id into board_id from boards where uniq_id = board_uuid;
    if board_id is null then
        raise exception 'Board not found';
    end if;

    if link_type = 'edit' then
        insert into board_edit_link (board_id, edit_link_uuid) values (board_id, link_uuid);
    elsif link_type = 'view' then
        insert into board_view_link (board_id, view_link_uuid) values (board_id, link_uuid);
    else
        raise exception 'Invalid link type';
    end if;
end;
$$;

create or replace function get_link(in_link_uuid UUID)
returns TABLE(
    board_id integer,
    link_uuid UUID,
    type varchar  -- or type text, depending on whether you change the function return type or not
)
language plpgsql
as $$
begin
    -- check in board_edit_link table
    select el.board_id into board_id from board_edit_link el where el.edit_link_uuid = in_link_uuid;
    if board_id is not null then
        -- Cast 'edit' literal to varchar
        return query select board_id, in_link_uuid as link_uuid, 'edit'::varchar as type;
    end if;

    -- check in board_view_link table
    select vl.board_id into board_id from board_view_link vl where vl.view_link_uuid = in_link_uuid;
    if board_id is not null then
        -- Cast 'view' literal to varchar
        return query select board_id, in_link_uuid as link_uuid, 'view'::varchar as type;
    end if;

    -- if not found in any table, return no rows
    return;
end;
$$;

create or replace function delete_link(board_uuid UUID, link_uuid UUID)
returns void language plpgsql as $$
begin
    delete from board_edit_link where board_id = (select id from boards where uniq_id = board_uuid) and edit_link_uuid = link_uuid;
    delete from board_view_link where board_id = (select id from boards where uniq_id = board_uuid) and view_link_uuid = link_uuid;
end;
$$;

-- A function a record about a new board in the boards table.
-- Returns the id of the new board.
create or replace function addboardrecord()
	returns table (id integer, uniq_id uuid)
	language plpgsql
as
$body$
declare
    id integer;
    uniq_id uuid;
begin
    uniq_id := uuid_generate_v4();
	insert into boards (uniq_id, boardname)
	values (uniq_id, 'New Board');
    id := currval('boards_id_seq');
	return query select id, uniq_id;
end;
$body$;

-- A function to add a new table to the database to store events for a new board.
-- This function is written in a procedural sql extension called plpgsql and does a dynamic schema altering query.
-- This function is called by the addBoard function in the Boards module.

create or replace function addboardtable(
	boardid integer
)
	returns void
	language plpgsql
as
$body$
begin
	execute 'create table if not exists board' || boardid || ' (
		logid serial primary key,
		eventid varchar(32),
		eventbody jsonb
	)';
end;
$body$;

-- Web app client objects to call server endponts, that call nodejs objects that call Postgresql database functions to CRUD boards and users

-- Table to link board to its owner
create table if not exists board_owner (
	board_id integer references boards(id) on delete cascade,
	owner_id integer references users(id) on delete cascade,
	primary key (board_id, owner_id)
);

-- Table to store board permissions
create table if not exists board_permissions (
	board_id integer references boards(id) on delete cascade,
	user_id integer references users(id) on delete cascade,
	can_view boolean default false,
	can_edit boolean default false,
	primary key (board_id, user_id)
);


-- Function to add a user to a board:
create or replace function add_user_to_board(
    board_uuid uuid,
    user_id integer
)
returns void
language plpgsql
as $$
begin
    insert into board_permissions (board_id, user_id, can_view, can_edit)
    values ((select id from boards where uniq_id = board_uuid), user_id, false, false);
end;
$$;

-- Function to update board permissions:
create or replace function update_board_permissions(
    board_uuid uuid,
    user_id integer,
    can_view boolean,
    can_edit boolean
)
returns void
language plpgsql
as $$
begin
    update board_permissions
    set can_view = can_view,
        can_edit = can_edit
    where board_id = (select id from boards where uniq_id = board_uuid)
        and user_id = user_id;
end;
$$;

-- Function to get board permissions for a user:
create or replace function get_board_permissions(
    board_uuid uuid,
    user_id integer
)
returns table (
    can_view boolean,
    can_edit boolean
)
language plpgsql
as $$
begin
    return query
    select can_view, can_edit
    from board_permissions
    where board_id = (select id from boards where uniq_id = board_uuid)
        and user_id = user_id;
end;
$$;

-- Grant view permission to a user for a specific board
create or replace function grant_view_permission(
	board_uuid uuid,
	user_id integer
)
returns void
language plpgsql
as $$
begin
	insert into board_permissions (board_id, user_id, can_view)
	values ((select id from boards where uniq_id = board_uuid), user_id, true);
end;
$$;

-- Grant edit permission to a user for a specific board
create or replace function grant_edit_permission(
	board_uuid uuid,
	user_id integer
)
returns void
language plpgsql
as $$
begin
	insert into board_permissions (board_id, user_id, can_edit)
	values ((select id from boards where uniq_id = board_uuid), user_id, true);
end;
$$;

-- Revoke all permissions for a user for a specific board
create or replace function revoke_permissions(
	board_uuid uuid,
	user_id integer
)
returns void
language plpgsql
as $$
begin
	delete from board_permissions
	where board_id = (select id from boards where uniq_id = board_uuid)
	and user_id = user_id;
end;
$$;

-- Check if a user has view permission for a specific board
create or replace function has_view_permission(
	board_uuid uuid,
	user_id integer
)
returns boolean
language plpgsql
as $$
begin
	return exists (select 1 from board_permissions where board_id = (select id from boards where uniq_id = board_uuid) and user_id = user_id and can_view = true);
end;
$$;

-- Check if a user has edit permission for a specific board
create or replace function has_edit_permission(
	board_uuid uuid,
	user_id integer
)
returns boolean
language plpgsql
as $$
begin
	return exists (select 1 from board_permissions where board_id = (select id from boards where uniq_id = board_uuid) and user_id = user_id and can_edit = true);
end;
$$;

-- Function to create a new private board 
create or replace function create_private_board(
    boardname varchar(32),
    owner_id integer,
    out board_id integer
)
returns integer
language plpgsql
as $$
begin
    insert into boards (uniq_id, boardname)
    values (uuid_generate_v4(), boardname)
    returning id into board_id;
    
    insert into board_owner (board_id, owner_id)
    values (board_id, owner_id);
    
    insert into board_permissions (board_id, user_id, can_view, can_edit)
    values (board_id, owner_id, true, true);
end;
$$;

-- Table to store board edit link
create table if not exists board_edit_link (
	board_id integer references boards(id) on delete cascade,
	edit_link_uuid UUID
);

-- Function to generate an edit link for a board
create or replace function generate_edit_link(
    p_board_id integer
) returns uuid as $$
declare
    v_edit_uuid uuid;
begin
    v_edit_uuid := uuid_generate_v4();
    insert into board_edit_link (board_id, edit_link_uuid) values (p_board_id, v_edit_uuid);
    return v_edit_uuid;
end;
$$ language plpgsql;

-- Function to retrieve a board's details by edit link
create or replace function get_board_by_edit_link(
    p_edit_link uuid
) returns table (
    board_id integer,
    created timestamp,
    boardname varchar(32)
) as $$
begin
    return query select b.id, b.created, b.boardname 
                 from boards b 
                 join board_edit_link bel on b.id = bel.board_id 
                 where bel.edit_link_uuid = p_edit_link;
end;
$$ language plpgsql;

-- Table to store board view link
create table if not exists board_view_link (
	board_id integer references boards(id) on delete cascade,
	view_link_uuid UUID
);

-- Function to retrieve a board's details by view link:
create or replace function get_board_by_view_link(
    p_view_link uuid
) returns table (
    board_id integer,
    created timestamp,
    boardname varchar(32)
) as $$
begin
    return query select b.id, b.created, b.boardname 
                 from boards b 
                 join board_view_link bvl on b.id = bvl.board_id 
                 where bvl.view_link_uuid = p_view_link;
end;
$$ language plpgsql;


-- Function to generate a view link for a board
create or replace function generate_view_link(
    p_board_id integer
) returns uuid as $$
declare
    v_view_uuid uuid;
begin
    v_view_uuid := uuid_generate_v4();
    insert into board_view_link (board_id, view_link_uuid) values (p_board_id, v_view_uuid);
    return v_view_uuid;
end;
$$ language plpgsql;

create table if not exists board_snapshots (
	board_id integer references boards(id) on delete cascade,
	snapshot jsonb
);

CREATE TABLE snapshots (
  id SERIAL PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES boards(uniq_id),
  snapshot JSON NOT NULL,
  last_event_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (board_id, last_event_order)
);


-- Function to create a board snapshot:
create or replace function create_board_snapshot(
    board_uuid uuid,
    snapshot jsonb
)
returns void
language plpgsql
as $$
begin
    insert into board_snapshots (board_id, snapshot)
    values ((select id from boards where uniq_id = board_uuid), snapshot);
end;
$$;

-- Function to retrieve the latest board snapshot:
create or replace function get_latest_board_snapshot(
    board_uuid uuid
)
returns jsonb
language plpgsql
as $$
begin
    return (
        select snapshot
        from board_snapshots
        where board_id = (select id from boards where uniq_id = board_uuid)
        order by board_id desc
        limit 1
    );
end;
$$;

-- Add a new table and function to store board snapshots
create or replace function save_board_snapshot(
	board_uuid uuid,
	snapshot jsonb
)
returns void
language plpgsql
as $$
begin
	-- Replace the existing snapshot with the new one
	update board_snapshots
	set snapshot = snapshot
	where board_id = (select id from boards where uniq_id = board_uuid);
	
	-- If the snapshot record doesn't exist, insert a new one
	if not exists (select 1 from board_snapshots where board_id = (select id from boards where uniq_id = board_uuid)) then
		insert into board_snapshots (board_id, snapshot)
		values ((select id from boards where uniq_id = board_uuid), snapshot);
	end if;
end;
$$;


-- Function to add new user
create or replace function add_user(
    email varchar
)
returns void as $$
begin
    insert into users (email) values (email);
end;
$$ language plpgsql;

-- Function to delete user
create or replace function delete_user(
    user_id integer
)
returns void as $$
begin
    delete from users where id = user_id;
end;
$$ language plpgsql;

-- Table to store user names
create table if not exists user_name (
	user_id integer references users(id) on delete cascade,
	name VARCHAR(100)
);

-- Function to add username:
create or replace function add_username(
    user_id integer,
    name varchar
)
returns void as $$
begin
    insert into user_name (user_id, name) values (user_id, name);
end;
$$ language plpgsql;

-- Function to change username:
create or replace function change_username(
    user_id integer,
    name varchar
)
returns void as $$
begin
    update user_name set name = name where user_id = user_id;
end;
$$ language plpgsql;

-- Table to store user passcode
create table if not exists user_passcode (
	id serial primary key,
	user_id integer references users(id) on delete cascade,
	passcode VARCHAR(10),
	created timestamp default now(),
	remaining_attempts integer default 3
);

-- Function to add passcode to a user
create or replace function add_passcode(
    user_id integer,
    passcode varchar
)
returns void as $$
begin
    insert into user_passcode (user_id, passcode) values (user_id, passcode);
end;
$$ language plpgsql;

-- Function to check passcode
create or replace function check_passcode(
		pass_code varchar,
		userid integer
)
returns boolean as $$
declare
		valid_passcode record;
begin
		with last_passcode as (select * from user_passcode where user_id = userid order by created desc limit 1)
		update user_passcode set remaining_attempts = remaining_attempts - 1 where user_id = userid and id = (select id from last_passcode);
		select * into valid_passcode from user_passcode where passcode = pass_code and remaining_attempts > 0 limit 1;
		return found;
end;
$$ language plpgsql;

-- Table to store user passwords
create table if not exists user_password (
	user_id integer references users(id) on delete cascade,
	password varchar(100)
);

-- Function to add password to a user
create or replace function add_password(
    user_id integer,
    password varchar
)
returns void as $$
begin
    insert into user_password (user_id, password) values (user_id, password);
end;
$$ language plpgsql;

-- Function to check password
create or replace function check_password(
    user_id integer,
    password varchar
)
returns boolean as $$
declare
    valid_password record;
begin
    select * into valid_password from user_password where user_id = user_id and password = password;
    return found;
end;
$$ language plpgsql;

create or replace function  save_token(
    user_id integer,
    token varchar
)
returns void as $$
begin
    update users set refresh_token = token where id = user_id;
end;
$$ language plpgsql;

create or replace function get_private_boards(
	userId integer
)
returns setof uuid as $$
begin
	return query
	select distinct b.uniq_id
	from public.boards b
	inner join public.board_permissions p ON b.id = p.board_id  
	where p.user_id = userId
	and (p.can_view = true or p.can_edit = true);
end;
$$ language plpgsql;