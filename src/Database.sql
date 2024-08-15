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
	boardname varchar(32),
    author_key uuid
);

ALTER TABLE boards ADD UNIQUE (uniq_id);

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
    select id into board_identifier from boards where uniq_id = board_uuid;

    if board_identifier is null then
        select * into link_result from get_link(board_uuid);
        board_identifier := link_result.board_id;
    end if;

    if board_identifier is null then
        raise exception 'Board UUID or Link UUID does not exist';
    end if;

    selectevents := format('select * from board%s where logid>%s order by logid asc', board_identifier, afterlogid);

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
        delete from user_edit_link where edit_link_uuid in (select edit_link_uuid from board_edit_link where board_id = board_id_to_delete);
        delete from user_view_link where view_link_uuid in (select view_link_uuid from board_view_link where board_id = board_id_to_delete);
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

-- Function to add an owner to a board
create or replace function add_board_owner(
    author_key uuid,
    owner_id integer
)
returns void
language plpgsql
as $$
declare
    board_id integer;
begin
    -- Get the board ID from the author_key
    select id into board_id from boards b where b.author_key = add_board_owner.author_key;
    if board_id is null then
        raise exception 'Board with author_key % does not exist', author_key;
    end if;

    insert into board_owner (board_id, owner_id)
    values (board_id, owner_id);
end;
$$;

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

-- Table to store user visited edit links
create table if not exists user_edit_link (
	user_id integer references users(id) on delete cascade,
	edit_link_uuid UUID
);

-- Table to store user visited view links
create table if not exists user_view_link (
	user_id integer references users(id) on delete cascade,
	view_link_uuid UUID
);

-- Function to record a user visiting an edit link
-- we asume that link exist
create or replace function user_visited_edit(
    p_user_id integer,
    p_edit_link_uuid uuid
) returns void as $$
declare
    link_exists boolean;
    is_author boolean;
begin
    -- Check if the user is the owner of the board
    select exists (
        select 1 
        from boards b
        join board_edit_link bel on b.id = bel.board_id
        join board_owner bo on b.id = bo.board_id
        where bel.edit_link_uuid = p_edit_link_uuid and bo.owner_id = p_user_id
    ) into is_author;

    if is_author then
        return;
    end if;

    insert into user_edit_link (user_id, edit_link_uuid)
    values (p_user_id, p_edit_link_uuid);
end;
$$ language plpgsql;

-- Function to record a user visiting a view link
-- we asume that link exist
create or replace function user_visited_view(
    p_user_id integer,
    p_view_link_uuid uuid
) returns void as $$
declare
    link_exists boolean;
    is_author boolean;
begin
    -- Check if the user is the owner of the board
    select exists (
        select 1 
        from boards b
        join board_edit_link bel on b.id = bel.board_id
        join board_owner bo on b.id = bo.board_id
        where bel.edit_link_uuid = p_edit_link_uuid and bo.owner_id = p_user_id
    ) into is_author;

    if is_author then
        return;
    end if;

    insert into user_view_link (user_id, view_link_uuid)
    values (p_user_id, p_view_link_uuid);
end;
$$ language plpgsql;

-- Function to record a user visiting a link (edit or view)
create or replace function user_visited(
    p_user_id integer,
    p_link_uuid uuid
) returns void as $$
declare
    link_type varchar;
begin
    lock table user_edit_link in exclusive mode;
    lock table user_view_link in exclusive mode;

    -- Check if the user has already visited the edit link
    if exists (select 1 from user_edit_link where user_id = p_user_id and edit_link_uuid = p_link_uuid) then
        return;
    end if;

    -- Check if the user has already visited the view link
    if exists (select 1 from user_view_link where user_id = p_user_id and view_link_uuid = p_link_uuid) then
        return;
    end if;

    -- Check if the link exists in the edit link table
    select 'edit' into link_type
    from board_edit_link
    where edit_link_uuid = p_link_uuid;

    if found then
        perform user_visited_edit(p_user_id, p_link_uuid);
        return;
    end if;

    -- Check if the link exists in the view link table
    select 'view' into link_type
    from board_view_link
    where view_link_uuid = p_link_uuid;

    if found then
        perform user_visited_view(p_user_id, p_link_uuid);
        return;
    end if;

    -- If the link does not exist in either table, raise an exception
    raise exception 'Link % does not exist', p_link_uuid;
end;
$$ language plpgsql;

-- Function to delete information that a user visited a link (edit or view)
create or replace function user_unvisited(
    p_user_id integer,
    p_link_uuid uuid
) returns void as $$
declare
    edit_deleted integer;
    view_deleted integer;
begin
    delete from user_edit_link
    where user_id = p_user_id and edit_link_uuid = p_link_uuid
    returning 1 into edit_deleted;

    delete from user_view_link
    where user_id = p_user_id and view_link_uuid = p_link_uuid
    returning 1 into view_deleted;

    if edit_deleted is null and view_deleted is null then
        raise exception 'No link found for user_id % and link_uuid %', p_user_id, p_link_uuid;
    end if;
end;
$$ language plpgsql;

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

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='board_snapshots' AND column_name='last_event_order') THEN
        ALTER TABLE board_snapshots
        ADD last_event_order INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

CREATE TABLE if not exists snapshots (
  id SERIAL PRIMARY KEY,
  board_id UUID NOT NULL REFERENCES boards(uniq_id),
  snapshot JSON NOT NULL,
  last_event_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (board_id, last_event_order)
);


-- Function to create a board snapshot:
DROP FUNCTION IF EXISTS create_board_snapshot(uuid, jsonb);

CREATE OR REPLACE FUNCTION create_board_snapshot(
    board_uuid uuid,
    snapshot jsonb,
    last_event integer
) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
    found_board_id integer;
BEGIN
    SELECT id INTO found_board_id FROM boards WHERE uniq_id = board_uuid;
    IF found_board_id IS NULL THEN
        RAISE EXCEPTION 'Board not found with UUID %', board_uuid;
    END IF;

    INSERT INTO board_snapshots (board_id, snapshot, last_event_order)
    VALUES (found_board_id, snapshot, last_event);
END;
$$;

DROP FUNCTION IF EXISTS get_latest_board_snapshot(uuid);
-- Function to retrieve the latest board snapshot:
CREATE OR REPLACE FUNCTION get_latest_board_snapshot(
    board_uuid UUID -- or link
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
    found_board_id INTEGER;
BEGIN
    -- First, try to find the board_id using the board UUID
    SELECT id INTO found_board_id FROM boards WHERE uniq_id = board_uuid;

    -- If not found, try finding the board_id using the edit link UUID
    IF found_board_id IS NULL THEN
        SELECT board_id INTO found_board_id
        FROM board_edit_link
        WHERE edit_link_uuid = board_uuid;
    END IF;

    -- If still not found, try finding the board_id using the view link UUID
    IF found_board_id IS NULL THEN
        SELECT board_id INTO found_board_id
        FROM board_view_link
        WHERE view_link_uuid = board_uuid;
    END IF;

    -- If no board_id was found by now, raise an error
    IF found_board_id IS NULL THEN
        RAISE EXCEPTION 'Board UUID, Edit Link UUID, or View Link UUID does not exist';
    END IF;

    -- Retrieve the latest snapshot for the found board_id
    RETURN (
        SELECT snapshot
        FROM board_snapshots
        WHERE board_id = found_board_id
        ORDER BY board_id DESC
        LIMIT 1
    );
END;
$$;

DROP FUNCTION IF EXISTS save_board_snapshot(uuid, jsonb);
-- Add a new table and function to store board snapshots
CREATE OR REPLACE FUNCTION save_board_snapshot(
    board_uuid UUID, -- or edit link 
    new_snapshot JSONB,
    last_event integer
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
DECLARE
    found_board_id INTEGER;
BEGIN
    -- First, try to find the board_id using the board UUID
    SELECT id INTO found_board_id FROM boards WHERE uniq_id = board_uuid;

    -- If not found, try finding the board_id using the edit link UUID
    IF found_board_id IS NULL THEN
        SELECT board_id INTO found_board_id
        FROM board_edit_link
        WHERE edit_link_uuid = board_uuid;
    END IF;

    -- If no board_id was found by now, raise an error
    IF found_board_id IS NULL THEN
        RAISE EXCEPTION 'Board UUID or Edit Link UUID does not exist';
    END IF;

    -- Replace the existing snapshot with the new one
    UPDATE board_snapshots
    SET snapshot = new_snapshot, last_event_order = last_event
    WHERE board_id = found_board_id;

    -- If the snapshot record doesn't exist, insert a new one
    IF NOT FOUND THEN
        INSERT INTO board_snapshots (board_id, snapshot, last_event_order)
        VALUES (found_board_id, new_snapshot, last_event);
    END IF;
END;
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
	remaining_attempts integer default 5
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


drop function if exists check_passcode(varchar, integer);
-- Function to check passcode
create or replace function check_passcode(
    pass_code varchar,
    userid integer
)
returns boolean as $$
declare
    last_passcode record;
begin
    select * into last_passcode
    from user_passcode
    where user_id = userid
    order by created desc
    limit 1;
    
    if last_passcode is not null then
        update user_passcode
        set remaining_attempts = remaining_attempts - 1
        where id = last_passcode.id;
    end if;

    if last_passcode is not null and last_passcode.passcode = pass_code and last_passcode.remaining_attempts > 0 then
        return true;
    else
        return false;
    end if;
end;
$$ language plpgsql;

-- Table to store user passwords
create table if not exists user_password (
	user_id integer references users(id) on delete cascade,
	password varchar(100)
);

-- Table to store user's password restore requests
create table if not exists password_reset_requests (
    id serial primary key,
    user_id integer references users(id) on delete cascade,
    token varchar(100) unique,
    expiration_time timestamp
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

-- Function to get the edit link for a board
create or replace function get_board_edit_link(
    board_uuid uuid
)
returns uuid
language plpgsql
as $$
declare
    edit_link uuid;
begin
    select edit_link_uuid into edit_link 
    from board_edit_link bel
    join boards b on bel.board_id = b.id
    where b.uniq_id = board_uuid;
    return edit_link;
end;
$$;

-- Function to get the view link for a board
create or replace function get_board_view_link(
    board_uuid uuid
)
returns uuid
language plpgsql
as $$
declare
    view_link uuid;
begin
    select view_link_uuid into view_link 
    from board_view_link bvl
    join boards b on bvl.board_id = b.id
    where b.uniq_id = board_uuid;
    return view_link;
end;
$$;

CREATE OR REPLACE FUNCTION get_user_boards(p_user_id integer)
RETURNS TABLE (
    authored_boards uuid,
    can_edit_boards uuid,
    can_view_boards uuid
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        authored.board_id AS authored_boards,
        can_edit.board_id AS can_edit_boards,
        can_view.board_id AS can_view_boards
    FROM (
        SELECT get_boards_user_authored(p_user_id) AS board_id
    ) authored
    FULL OUTER JOIN (
        SELECT get_boards_user_can_edit(p_user_id) AS board_id
    ) can_edit ON true
    FULL OUTER JOIN (
        SELECT get_boards_user_can_view(p_user_id) AS board_id
    ) can_view ON true;
END;
$$;

create or replace function get_boards_user_authored(
	userId integer
)
returns setof uuid as $$
begin
	return query
	select b.uniq_id
	from boards b
	inner join board_owner o ON b.id = o.board_id
	where o.owner_id = userId;
end;
$$ language plpgsql;

create or replace function get_boards_user_can_view(
	userId integer
)
returns setof uuid as $$
begin
	return query
	select b.uniq_id
	from boards b
	inner join board_permissions p ON b.id = p.board_id
	where p.user_id = userId
	and p.can_view = true;
end;
$$ language plpgsql;

create or replace function get_boards_user_can_edit(
	userId integer
)
returns setof uuid as $$
begin
	return query
	select b.uniq_id
	from boards b
	inner join board_permissions p ON b.id = p.board_id
	where p.user_id = userId
	and p.can_edit = true;
end;
$$ language plpgsql;

create or replace function get_boards_by_user(
	userId integer
)
returns setof uuid as $$
begin
	return query
	select * from get_boards_user_authored(userId)
	union
	select * from get_boards_user_can_view(userId)
	union
	select * from get_boards_user_can_edit(userId);
end;
$$ language plpgsql;

ALTER TABLE boards ALTER COLUMN boardname TYPE text;

DROP FUNCTION IF EXISTS create_board(uuid, varchar(32));
DROP FUNCTION IF EXISTS create_private_board(uuid, varchar(32), integer);
DROP FUNCTION IF EXISTS rename_board(uuid, varchar);

CREATE OR REPLACE FUNCTION create_board(
    board_id uuid,
    title text,  -- or varchar(255)
    author_key uuid
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    new_board_id uuid := board_id; 
    created_board_id integer;
BEGIN
    IF (new_board_id IS NULL) THEN
        new_board_id := uuid_generate_v4();
    END IF;

    INSERT INTO boards (uniq_id, boardname, author_key)
    VALUES (new_board_id, title, author_key)
    RETURNING id INTO created_board_id;

    PERFORM addboardtable(created_board_id);

    RETURN new_board_id;
END;
$$;

CREATE OR REPLACE FUNCTION create_private_board(
    board_id uuid,
    title text,  -- or varchar(255)
    owner_id integer
)
RETURNS uuid
LANGUAGE plpgsql
AS $$
DECLARE
    board_uuid uuid := board_id;
    created_board_id integer;
BEGIN
    IF (board_uuid IS NULL) THEN
        board_uuid := uuid_generate_v4();
    END IF;
    PERFORM create_board(board_uuid, title);
    SELECT id INTO created_board_id FROM boards WHERE uniq_id = board_uuid;

    INSERT INTO board_owner ("board_id", owner_id)
    VALUES (created_board_id, owner_id);

    INSERT INTO board_permissions ("board_id", user_id, can_view, can_edit)
    VALUES (created_board_id, owner_id, TRUE, TRUE);

    RETURN board_uuid;
END;
$$;

CREATE OR REPLACE FUNCTION rename_board(
    board_uuid uuid,
    new_boardname text  -- or varchar(255)
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    board_id integer;
BEGIN
    SELECT id INTO board_id FROM boards WHERE uniq_id = board_uuid;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Board not found with UUID %', board_uuid USING errcode = 'XXXXX';
    END IF;
    UPDATE boards SET boardname = new_boardname WHERE id = board_id;
END;
$$;
DROP FUNCTION IF EXISTS get_event_count_since_last_snapshot(uuid);
CREATE OR REPLACE FUNCTION get_event_count_since_last_snapshot(
    board_or_link_uuid UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    board_id INTEGER;
    event_count INTEGER;
    board_uuid UUID;
BEGIN
    SELECT id, uniq_id INTO board_id, board_uuid FROM boards WHERE uniq_id = board_or_link_uuid;

    IF board_id IS NULL THEN
        SELECT gl.board_id, b.uniq_id INTO board_id, board_uuid
        FROM get_link(board_or_link_uuid) gl
        JOIN boards b ON gl.board_id = b.id;
    END IF;

    IF board_id IS NULL THEN
        RAISE EXCEPTION 'Board UUID or Link UUID does not exist';
    END IF;

    EXECUTE format(
        'SELECT COUNT(*)
         FROM board%s 
         WHERE logid > (SELECT COALESCE(MAX(last_event_order), 0) 
                        FROM board_snapshots 
                        WHERE board_id = %L)',
         board_id,
         board_id
     )
     INTO event_count;

    RETURN event_count;
END;
$$;

ALTER TABLE boards ADD COLUMN IF NOT EXISTS author_key uuid;
