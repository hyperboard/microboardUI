# PGSQL

This file is a compilation of pgsql documentation. I edit this file to learn pgsql. When i am done i will leave it here as a refference.

PL/pgSQL is a loadable procedural language for the PostgreSQL database system that can be used to create functions, procedures, and triggers.

PL/pgSQL adds control structures to the SQL language and inherits all user-defined types, functions, procedures, and operators.

Functions created with PL/pgSQL can be used anywhere that built-in functions could be used.

In PostgreSQL 9.0 and later, PL/pgSQL is installed by default. However it is still a loadable module, so especially security-conscious administrators could choose to remove it.

## When to use PL/pgSQL

1. When performance bottleneck is costly extra round trips between client and server. With SQL client application must send each query to the database server, wait for it to be processed, receive and process the results, do some computation, then send further queries to the server. With pgsql intermediate results that the client does not need do not have to be marshaled or transferred between server and client

2. When it is necessary to construct SQL queries dynamicly.

## Which Argument and Result Data Types you can use

Functions can accept as arguments and return as result

-   any **scalar** or **array** data type,
-   **composite** type (row type) specified by name,
-   the **polymorphic** types, when types need to vary from call to call,
-   **record**, which means that any composite type will do as input or that the result is a row type whose columns are determined by specification in the calling query

PL/pgSQL functions can be declared to accept a variable number of arguments by using the VARIADIC marker. This works exactly the same way as for SQL functions.

PL/pgSQL functions can also be declared to return a “set” (or table) of any data type that can be returned as a single instance. Such a function generates its output by executing RETURN NEXT for each desired element of the result set, or by using RETURN QUERY to output the result of evaluating a query.

Finally, a PL/pgSQL function can be declared to return void if it has no useful return value. (Alternatively, it could be written as a procedure in that case.)

PL/pgSQL functions can also be declared with output parameters in place of an explicit specification of the return type. This does not add any fundamental capability to the language, but it is often convenient, especially for returning multiple values. The `RETURNS TABLE` notation can also be used in place of `RETURNS SETOF`.

## To define a funciton

Use CREATE FUNCTION commands.

```sql
CREATE FUNCTION somefunc(integer, text) RETURNS integer
LANGUAGE plpgsql;
AS 'function body text'
```

The CREATE FUNCTION command takes a string literal as the body of a function. Any single quotes or backslashes in the function body must be escaped by doubling them. To avoid escaping single quotes or backslashes in the body of a function use dollar quoting to write the function body string.

## To structure a function

Define their blocks. A block is defined as:

```sql
[ <<label>> ]
[ DECLARE
declarations ]
BEGIN
statements
END [ label ];
```

Each declaration and each statement within a block is terminated by a semicolon. A block that appears within another block must have a semicolon after END, as shown above; however the final END that concludes a function body does not require a semicolon.

A common mistake is to write a semicolon immediately after BEGIN. This is incorrect and will result in a syntax error.

A label is only needed if you want to identify the block for use in an EXIT statement, or to qualify the names of the variables declared in the block. If a label is given after END, it must match the label at the block's beginning.

All key words are case-insensitive. Identifiers are implicitly converted to lower case unless double-quoted, just as they are in ordinary SQL commands.

Comments work the same way in PL/pgSQL code as in ordinary SQL. A double dash (--) starts a comment that extends to the end of the line. A /_ starts a block comment that extends to the matching occurrence of _/. Block comments nest.

Any statement in the statement section of a block can be a subblock. Subblocks can be used for logical grouping or to localize variables to a small group of statements. Variables declared in a subblock mask any similarly-named variables of outer blocks for the duration of the subblock; but you can access the outer variables anyway if you qualify their names with their block's label. For example:

```sql
CREATE FUNCTION somefunc() RETURNS integer AS $$
<< outerblock >>
DECLARE
quantity integer := 30;
BEGIN
RAISE NOTICE 'Quantity here is %', quantity; -- Prints 30
quantity := 50;
--
-- Create a subblock
--
DECLARE
quantity integer := 80;
BEGIN
RAISE NOTICE 'Quantity here is %', quantity; -- Prints 80
RAISE NOTICE 'Outer quantity here is %', outerblock.quantity; -- Prints 50
END;

    RAISE NOTICE 'Quantity here is %', quantity;  -- Prints 50

    RETURN quantity;

END;

$$
LANGUAGE plpgsql;
```

There is actually a hidden “outer block” surrounding the body of any PL/pgSQL function. This block provides the declarations of the function's parameters (if any), as well as some special variables such as FOUND. The outer block is labeled with the function's name, meaning that parameters and special variables can be qualified with the function's name.

It is important not to confuse the use of BEGIN/END for grouping statements in PL/pgSQL with the similarly-named SQL commands for transaction control. PL/pgSQL's BEGIN/END are only for grouping; they do not start or end a transaction. Also, a block containing an EXCEPTION clause effectively forms a subtransaction that can be rolled back without affecting the outer transaction.

## To declare variables

All variables used in a block must be declared in the declarations section of the block. (The only exceptions are that the loop variable of a FOR loop iterating over a range of integer values is automatically declared as an integer variable, and likewise the loop variable of a FOR loop iterating over a cursor's result is automatically declared as a record variable.)

PL/pgSQL variables can have any SQL data type, such as integer, varchar, and char.

Here are some examples of variable declarations:

```sql
user_id integer;
quantity numeric(5);
url varchar;
myrow tablename%ROWTYPE;
myfield tablename.columnname%TYPE;
arow RECORD;
```

The general syntax of a variable declaration is:

`name [ CONSTANT ] type [ COLLATE collation_name ] [ NOT NULL ] [ { DEFAULT | := | = } expression ];`

The DEFAULT clause, if given, specifies the initial value assigned to the variable when the block is entered. If the DEFAULT clause is not given then the variable is initialized to the SQL null value. The CONSTANT option prevents the variable from being assigned to after initialization, so that its value will remain constant for the duration of the block. The COLLATE option specifies a collation to use for the variable. If NOT NULL is specified, an assignment of a null value results in a run-time error. All variables declared as NOT NULL must have a nonnull default value specified. Equal (=) can be used instead of PL/SQL-compliant :=.

A variable's default value is evaluated and assigned to the variable each time the block is entered (not just once per function call). So, for example, assigning now() to a variable of type timestamp causes the variable to have the time of the current function call, not the time when the function was precompiled.

Examples:

```sql
quantity integer DEFAULT 32;
url varchar := 'http://mysite.com';
transaction_time CONSTANT timestamp with time zone := now();
```

Once declared, a variable's value can be used in later initialization expressions in the same block, for example:

```sql
DECLARE
x integer := 1;
y integer := x + 1;
```

## To declare parameters

Parameters passed to functions are named with the identifiers $1, $2, etc. Optionally, aliases can be declared for $n parameter names for increased readability. Either the alias or the numeric identifier can then be used to refer to the parameter value.

There are two ways to create an alias. The preferred way is to give a name to the parameter in the CREATE FUNCTION command, for example:

```sql
CREATE FUNCTION sales_tax(subtotal real) RETURNS real AS

$$

BEGIN
RETURN subtotal \* 0.06;
END;


$$

LANGUAGE plpgsql;

The other way is to explicitly declare an alias, using the declaration syntax

name ALIAS FOR $n;

The same example in this style looks like:

CREATE FUNCTION sales_tax(real) RETURNS real AS

$$

DECLARE
subtotal ALIAS FOR $1;
BEGIN
RETURN subtotal \* 0.06;
END;


$$

LANGUAGE plpgsql;
```

These two examples are not perfectly equivalent. In the first case, subtotal could be referenced as sales_tax.subtotal, but in the second case it could not. (Had we attached a label to the inner block, subtotal could be qualified with that label, instead.)

Some more examples:

```sql
CREATE FUNCTION instr(varchar, integer) RETURNS integer AS

$$

DECLARE
v_string ALIAS FOR $1;
index ALIAS FOR $2;
BEGIN
-- some computations using v_string and index here
END;


$$

LANGUAGE plpgsql;

CREATE FUNCTION concat_selected_fields(in_t sometablename) RETURNS text AS

$$

BEGIN
RETURN in_t.f1 || in_t.f3 || in_t.f5 || in_t.f7;
END;


$$

LANGUAGE plpgsql;
```

When a PL/pgSQL function is declared with output parameters, the output parameters are given $n names and optional aliases in just the same way as the normal input parameters. An output parameter is effectively a variable that starts out NULL; it should be assigned to during the execution of the function. The final value of the parameter is what is returned. For instance, the sales-tax example could also be done this way:

```sql
CREATE FUNCTION sales_tax(subtotal real, OUT tax real) AS

$$

BEGIN
tax := subtotal \* 0.06;
END;


$$

LANGUAGE plpgsql;
```

Notice that we omitted RETURNS real — we could have included it, but it would be redundant.

To call a function with OUT parameters, omit the output parameter(s) in the function call: `SELECT sales_tax(100.00);`

Output parameters are most useful when returning multiple values. A trivial example is:

```sql
CREATE FUNCTION sum_n_product(x int, y int, OUT sum int, OUT prod int) AS

$$

BEGIN
sum := x + y;
prod := x \* y;
END;


$$

LANGUAGE plpgsql;

SELECT \* FROM sum_n_product(2, 4);
sum | prod
-----+------
6 | 8
```

This effectively creates an anonymous record type for the function's results. If a RETURNS clause is given, it must say RETURNS record.

This also works with procedures, for example:

```sql
CREATE PROCEDURE sum_n_product(x int, y int, OUT sum int, OUT prod int) AS

$$

BEGIN
sum := x + y;
prod := x \* y;
END;


$$

LANGUAGE plpgsql;
```

In a call to a procedure, all the parameters must be specified. For output parameters, NULL may be specified when calling the procedure from plain SQL:

```sql
CALL sum_n_product(2, 4, NULL, NULL);
sum | prod
-----+------
6 | 8
```

However, when calling a procedure from PL/pgSQL, you should instead write a variable for any output parameter; the variable will receive the result of the call.

Another way to declare a PL/pgSQL function is with RETURNS TABLE, for example:

```sql
CREATE FUNCTION extended_sales(p_itemno int)
RETURNS TABLE(quantity int, total numeric) AS

$$

BEGIN
RETURN QUERY SELECT s.quantity, s.quantity \* s.price FROM sales AS s
WHERE s.itemno = p_itemno;
END;


$$

LANGUAGE plpgsql;
```

This is exactly equivalent to declaring one or more OUT parameters and specifying RETURNS SETOF sometype.

When the return type of a PL/pgSQL function is declared as a polymorphic type, a special parameter $0 is created. Its data type is the actual return type of the function, as deduced from the actual input types. This allows the function to access its actual return type. $0 is initialized to null and can be modified by the function, so it can be used to hold the return value if desired, though that is not required. $0 can also be given an alias. For example, this function works on any data type that has a + operator:

```sql
CREATE FUNCTION add_three_values(v1 anyelement, v2 anyelement, v3 anyelement)
RETURNS anyelement AS

$$

DECLARE
result ALIAS FOR $0;
BEGIN
result := v1 + v2 + v3;
RETURN result;
END;


$$

LANGUAGE plpgsql;
```

The same effect can be obtained by declaring one or more output parameters as polymorphic types. In this case the special $0 parameter is not used; the output parameters themselves serve the same purpose. For example:

```sql
CREATE FUNCTION add_three_values(v1 anyelement, v2 anyelement, v3 anyelement,
OUT sum anyelement)
AS

$$

BEGIN
sum := v1 + v2 + v3;
END;


$$

LANGUAGE plpgsql;
```

In practice it might be more useful to declare a polymorphic function using the anycompatible family of types, so that automatic promotion of the input arguments to a common type will occur. For example:

```sql
CREATE FUNCTION add_three_values(v1 anycompatible, v2 anycompatible, v3 anycompatible)
RETURNS anycompatible AS

$$

BEGIN
RETURN v1 + v2 + v3;
END;


$$

LANGUAGE plpgsql;
```

With this example, a call such as `SELECT add_three_values(1, 2, 4.7);` will work, automatically promoting the integer inputs to numeric. The function using anyelement would require you to cast the three inputs to the same type manually.

## To define aliases for variables or parameters

Use ALIAS

`newname ALIAS FOR oldname;`

The ALIAS syntax is more general than is suggested in the previous section: you can declare an alias for any variable, not just function parameters. The main practical use for this is to assign a different name for variables with predetermined names, such as NEW or OLD within a trigger function.

Examples:

```sql
DECLARE
prior ALIAS FOR old;
updated ALIAS FOR new;
```

Since ALIAS creates two different ways to name the same object, unrestricted use can be confusing. It's best to use it only for the purpose of overriding predetermined names.

## To copy types

`variable%TYPE`

%TYPE provides the data type of a variable or table column. You can use this to declare variables that will hold database values. For example, let's say you have a column named user_id in your users table. To declare a variable with the same data type as users.user_id you write:

`user_id users.user_id%TYPE;`

By using %TYPE you don't need to know the data type of the structure you are referencing, and most importantly, if the data type of the referenced item changes in the future (for instance: you change the type of user_id from integer to real), you might not need to change your function definition.

%TYPE is particularly valuable in polymorphic functions, since the data types needed for internal variables can change from one call to the next. Appropriate variables can be created by applying %TYPE to the function's arguments or result placeholders.

## To use row Types

`name table_name%ROWTYPE;`
`name composite_type_name;`

A variable of a composite type is called a row variable (or row-type variable). Such a variable can hold a whole row of a SELECT or FOR query result, so long as that query's column set matches the declared type of the variable. The individual fields of the row value are accessed using the usual dot notation, for example rowvar.field.

A row variable can be declared to have the same type as the rows of an existing table or view, by using the table_name%ROWTYPE notation; or it can be declared by giving a composite type's name. (Since every table has an associated composite type of the same name, it actually does not matter in PostgreSQL whether you write %ROWTYPE or not. But the form with %ROWTYPE is more portable.)

Parameters to a function can be composite types (complete table rows). In that case, the corresponding identifier $n will be a row variable, and fields can be selected from it, for example $1.user_id.

Here is an example of using composite types. table1 and table2 are existing tables having at least the mentioned fields:

```sql
CREATE FUNCTION merge_fields(t_row table1) RETURNS text AS

$$

DECLARE
t2_row table2%ROWTYPE;
BEGIN
SELECT \* INTO t2_row FROM table2 WHERE ... ;
RETURN t_row.f1 || t2_row.f3 || t_row.f5 || t2_row.f7;
END;


$$

LANGUAGE plpgsql;

SELECT merge_fields(t.\*) FROM table1 t WHERE ... ;
```

## To use record Types

`name RECORD;`

Record variables are similar to row-type variables, but they have no predefined structure. They take on the actual row structure of the row they are assigned during a SELECT or FOR command. The substructure of a record variable can change each time it is assigned to. A consequence of this is that until a record variable is first assigned to, it has no substructure, and any attempt to access a field in it will draw a run-time error.

Note that RECORD is not a true data type, only a placeholder. One should also realize that when a PL/pgSQL function is declared to return type record, this is not quite the same concept as a record variable, even though such a function might use a record variable to hold its result. In both cases the actual row structure is unknown when the function is written, but for a function returning record the actual structure is determined when the calling query is parsed, whereas a record variable can change its row structure on-the-fly.

## To write expressions

All expressions used in PL/pgSQL statements are processed using the server's main SQL executor. For example, when you write a PL/pgSQL statement like

`IF expression THEN ...`

PL/pgSQL will evaluate the expression by feeding a query like

`SELECT expression`

to the main SQL engine. While forming the SELECT command, any occurrences of PL/pgSQL variable names are replaced by query parameters. This allows the query plan for the SELECT to be prepared just once and then reused for subsequent evaluations with different values of the variables. Thus, what really happens on first use of an expression is essentially a PREPARE command. For example, if we have declared two integer variables x and y, and we write

`IF x < y THEN ...`

what happens behind the scenes is equivalent to

`PREPARE statement_name(integer, integer) AS SELECT $1 < $2;`

and then this prepared statement is EXECUTEd for each execution of the IF statement, with the current values of the PL/pgSQL variables supplied as parameter values. Normally these details are not important to a PL/pgSQL user, but they are useful to know when trying to diagnose a problem. More information appears in Section 43.11.2.

Since an expression is converted to a SELECT command, it can contain the same clauses that an ordinary SELECT would, except that it cannot include a top-level UNION, INTERSECT, or EXCEPT clause. Thus for example one could test whether a table is non-empty with

`IF count(\*) > 0 FROM my_table THEN ...`

since the expression between IF and THEN is parsed as though it were SELECT count(\*) > 0 FROM my_table. The SELECT must produce a single column, and not more than one row. (If it produces no rows, the result is taken as NULL.)

## To assign a value to a variable

An assignment of a value to a PL/pgSQL variable is written as: `variable { := | = } expression;`

As explained previously, the expression in such a statement is evaluated by means of an SQL SELECT command sent to the main database engine. The expression must yield a single value (possibly a row value, if the variable is a row or record variable). The target variable can be a simple variable (optionally qualified with a block name), a field of a row or record target, or an element or slice of an array target. Equal (=) can be used instead of PL/SQL-compliant :=.

If the expression's result data type doesn't match the variable's data type, the value will be coerced as though by an assignment cast (see Section 10.4). If no assignment cast is known for the pair of data types involved, the PL/pgSQL interpreter will attempt to convert the result value textually, that is by applying the result type's output function followed by the variable type's input function. Note that this could result in run-time errors generated by the input function, if the string form of the result value is not acceptable to the input function.

Examples:

```sql
tax := subtotal \* 0.06;
my_record.user_id := 20;
my_array[j] := 20;
my_array[1:3] := array[1,2,3];
complex_array[n].realpart = 12.3;
```

## To execute SQL commands

In general, any SQL command that does not return rows can be executed within a PL/pgSQL function just by writing the command. For example, you could create and fill a table by writing

```sql
CREATE TABLE mytable (id int primary key, data text);
INSERT INTO mytable VALUES (1,'one'), (2,'two');
```

If the command does return rows (for example SELECT, or INSERT/UPDATE/DELETE with RETURNING), there are two ways to proceed. When the command will return at most one row, or you only care about the first row of output, write the command as usual but add an INTO clause to capture the output, as described in Section 43.5.3. To process all of the output rows, write the command as the data source for a FOR loop, as described in Section 43.6.6.

Usually it is not sufficient just to execute statically-defined SQL commands. Typically you'll want a command to use varying data values, or even to vary in more fundamental ways such as by using different table names at different times. Again, there are two ways to proceed depending on the situation.

PL/pgSQL variable values can be automatically inserted into optimizable SQL commands, which are SELECT, INSERT, UPDATE, DELETE, and certain utility commands that incorporate one of these, such as EXPLAIN and CREATE TABLE ... AS SELECT. In these commands, any PL/pgSQL variable name appearing in the command text is replaced by a query parameter, and then the current value of the variable is provided as the parameter value at run time. This is exactly like the processing described earlier for expressions.

When executing an optimizable SQL command in this way, PL/pgSQL may cache and re-use the execution plan for the command.

Non-optimizable SQL commands (also called utility commands) are not capable of accepting query parameters. So automatic substitution of PL/pgSQL variables does not work in such commands. To include non-constant text in a utility command executed from PL/pgSQL, you must build the utility command as a string and then EXECUTE it.

EXECUTE must also be used if you want to modify the command in some other way than supplying a data value, for example by changing a table name.

Sometimes it is useful to evaluate an expression or SELECT query but discard the result, for example when calling a function that has side-effects but no useful result value. To do this in PL/pgSQL, use the PERFORM statement: `PERFORM query;`

This executes query and discards the result. Write the query the same way you would write an SQL SELECT command, but replace the initial keyword SELECT with PERFORM. For WITH queries, use PERFORM and then place the query in parentheses. (In this case, the query can only return one row.) PL/pgSQL variables will be substituted into the query just as described above, and the plan is cached in the same way. Also, the special variable FOUND is set to true if the query produced at least one row, or false if it produced no rows.

One might expect that writing SELECT directly would accomplish this result, but at present the only accepted way to do it is PERFORM. An SQL command that can return rows, such as SELECT, will be rejected as an error unless it has an INTO clause as discussed in the next section.

An example:

```sql
PERFORM create_mv('cs_session_page_requests_mv', my_query);
```

## Executing a Command with a Single-Row Result

The result of an SQL command yielding a single row (possibly of multiple columns) can be assigned to a record variable, row-type variable, or list of scalar variables. This is done by writing the base SQL command and adding an INTO clause. For example,

```sql
SELECT select_expressions INTO [STRICT] target FROM ...;
INSERT ... RETURNING expressions INTO [STRICT] target;
UPDATE ... RETURNING expressions INTO [STRICT] target;
DELETE ... RETURNING expressions INTO [STRICT] target;
```

where target can be a record variable, a row variable, or a comma-separated list of simple variables and record/row fields. PL/pgSQL variables will be substituted into the rest of the command (that is, everything but the INTO clause) just as described above, and the plan is cached in the same way. This works for SELECT, INSERT/UPDATE/DELETE with RETURNING, and certain utility commands that return row sets, such as EXPLAIN. Except for the INTO clause, the SQL command is the same as it would be written outside PL/pgSQL.

Note that this interpretation of SELECT with INTO is quite different from PostgreSQL's regular SELECT INTO command, wherein the INTO target is a newly created table. If you want to create a table from a SELECT result inside a PL/pgSQL function, use the syntax CREATE TABLE ... AS SELECT.

If a row variable or a variable list is used as target, the command's result columns must exactly match the structure of the target as to number and data types, or else a run-time error occurs. When a record variable is the target, it automatically configures itself to the row type of the command's result columns.

The INTO clause can appear almost anywhere in the SQL command. Customarily it is written either just before or just after the list of select_expressions in a SELECT command, or at the end of the command for other command types. It is recommended that you follow this convention in case the PL/pgSQL parser becomes stricter in future versions.

If STRICT is not specified in the INTO clause, then target will be set to the first row returned by the command, or to nulls if the command returned no rows. (Note that “the first row” is not well-defined unless you've used ORDER BY.) Any result rows after the first row are discarded. You can check the special FOUND variable (see Section 43.5.5) to determine whether a row was returned:

```sql
SELECT \* INTO myrec FROM emp WHERE empname = myname;
IF NOT FOUND THEN
RAISE EXCEPTION 'employee % not found', myname;
END IF;
```

If the STRICT option is specified, the command must return exactly one row or a run-time error will be reported, either NO_DATA_FOUND (no rows) or TOO_MANY_ROWS (more than one row). You can use an exception block if you wish to catch the error, for example:

```sql
BEGIN
SELECT \* INTO STRICT myrec FROM emp WHERE empname = myname;
EXCEPTION
WHEN NO_DATA_FOUND THEN
RAISE EXCEPTION 'employee % not found', myname;
WHEN TOO_MANY_ROWS THEN
RAISE EXCEPTION 'employee % not unique', myname;
END;
```

Successful execution of a command with STRICT always sets FOUND to true.

For INSERT/UPDATE/DELETE with RETURNING, PL/pgSQL reports an error for more than one returned row, even when STRICT is not specified. This is because there is no option such as ORDER BY with which to determine which affected row should be returned.

If print_strict_params is enabled for the function, then when an error is thrown because the requirements of STRICT are not met, the DETAIL part of the error message will include information about the parameters passed to the command. You can change the print_strict_params setting for all functions by setting plpgsql.print_strict_params, though only subsequent function compilations will be affected. You can also enable it on a per-function basis by using a compiler option, for example:

```sql
CREATE FUNCTION get_userid(username text) RETURNS int
AS $$
#print_strict_params on
DECLARE
userid int;
BEGIN
SELECT users.userid INTO STRICT userid
FROM users WHERE users.username = get_userid.username;
RETURN userid;
END;
$$ LANGUAGE plpgsql;
```

On failure, this function might produce an error message such as

```
ERROR: query returned no rows
DETAIL: parameters: $1 = 'nosuchuser'
CONTEXT: PL/pgSQL function get_userid(text) line 6 at SQL statement
```

The STRICT option matches the behavior of Oracle PL/SQL's SELECT INTO and related statements.

## Executing Dynamic Commands

Oftentimes you will want to generate dynamic commands inside your PL/pgSQL functions, that is, commands that will involve different tables or different data types each time they are executed. PL/pgSQL's normal attempts to cache plans for commands (as discussed in Section 43.11.2) will not work in such scenarios. To handle this sort of problem, the EXECUTE statement is provided:

```sql
EXECUTE command-string [ INTO [STRICT] target ] [ USING expression [, ... ] ];
```

where command-string is an expression yielding a string (of type text) containing the command to be executed. The optional target is a record variable, a row variable, or a comma-separated list of simple variables and record/row fields, into which the results of the command will be stored. The optional USING expressions supply values to be inserted into the command.

No substitution of PL/pgSQL variables is done on the computed command string. Any required variable values must be inserted in the command string as it is constructed; or you can use parameters as described below.

Also, there is no plan caching for commands executed via EXECUTE. Instead, the command is always planned each time the statement is run. Thus the command string can be dynamically created within the function to perform actions on different tables and columns.

The INTO clause specifies where the results of an SQL command returning rows should be assigned. If a row variable or variable list is provided, it must exactly match the structure of the command's results; if a record variable is provided, it will configure itself to match the result structure automatically. If multiple rows are returned, only the first will be assigned to the INTO variable(s). If no rows are returned, NULL is assigned to the INTO variable(s). If no INTO clause is specified, the command results are discarded.

If the STRICT option is given, an error is reported unless the command produces exactly one row.

The command string can use parameter values, which are referenced in the command as $1, $2, etc. These symbols refer to values supplied in the USING clause. This method is often preferable to inserting data values into the command string as text: it avoids run-time overhead of converting the values to text and back, and it is much less prone to SQL-injection attacks since there is no need for quoting or escaping. An example is:

```sql
EXECUTE 'SELECT count(\*) FROM mytable WHERE inserted_by = $1 AND inserted <= $2'
INTO c
USING checked_user, checked_date;
```

Note that parameter symbols can only be used for data values — if you want to use dynamically determined table or column names, you must insert them into the command string textually. For example, if the preceding query needed to be done against a dynamically selected table, you could do this:

```sql
EXECUTE 'SELECT count(\*) FROM '
|| quote_ident(tabname)
|| ' WHERE inserted_by = $1 AND inserted <= $2'
INTO c
USING checked_user, checked_date;
```

A cleaner approach is to use format()'s %I specification to insert table or column names with automatic quoting:

```sql
EXECUTE format('SELECT count(\*) FROM %I '
'WHERE inserted_by = $1 AND inserted <= $2', tabname)
INTO c
USING checked_user, checked_date;
```

(This example relies on the SQL rule that string literals separated by a newline are implicitly concatenated.)

Another restriction on parameter symbols is that they only work in optimizable SQL commands (SELECT, INSERT, UPDATE, DELETE, MERGE, and certain commands containing one of these). In other statement types (generically called utility statements), you must insert values textually even if they are just data values.

An EXECUTE with a simple constant command string and some USING parameters, as in the first example above, is functionally equivalent to just writing the command directly in PL/pgSQL and allowing replacement of PL/pgSQL variables to happen automatically. The important difference is that EXECUTE will re-plan the command on each execution, generating a plan that is specific to the current parameter values; whereas PL/pgSQL may otherwise create a generic plan and cache it for re-use. In situations where the best plan depends strongly on the parameter values, it can be helpful to use EXECUTE to positively ensure that a generic plan is not selected.

SELECT INTO is not currently supported within EXECUTE; instead, execute a plain SELECT command and specify INTO as part of the EXECUTE itself.
Note

The PL/pgSQL EXECUTE statement is not related to the EXECUTE SQL statement supported by the PostgreSQL server. The server's EXECUTE statement cannot be used directly within PL/pgSQL functions (and is not needed).

## Quoting Values in Dynamic Queries

When working with dynamic commands you will often have to handle escaping of single quotes. The recommended method for quoting fixed text in your function body is dollar quoting. (If you have legacy code that does not use dollar quoting, please refer to the overview in Section 43.12.1, which can save you some effort when translating said code to a more reasonable scheme.)

Dynamic values require careful handling since they might contain quote characters. An example using format() (this assumes that you are dollar quoting the function body so quote marks need not be doubled):

```sql
EXECUTE format('UPDATE tbl SET %I = $1 '
'WHERE key = $2', colname) USING newvalue, keyvalue;
```

It is also possible to call the quoting functions directly:

```sql
EXECUTE 'UPDATE tbl SET '
|| quote_ident(colname)
|| ' = '
|| quote_literal(newvalue)
|| ' WHERE key = '
|| quote_literal(keyvalue);
```

This example demonstrates the use of the quote_ident and quote_literal functions (see Section 9.4). For safety, expressions containing column or table identifiers should be passed through quote_ident before insertion in a dynamic query. Expressions containing values that should be literal strings in the constructed command should be passed through quote_literal. These functions take the appropriate steps to return the input text enclosed in double or single quotes respectively, with any embedded special characters properly escaped.

Because quote_literal is labeled STRICT, it will always return null when called with a null argument. In the above example, if newvalue or keyvalue were null, the entire dynamic query string would become null, leading to an error from EXECUTE. You can avoid this problem by using the quote_nullable function, which works the same as quote_literal except that when called with a null argument it returns the string NULL. For example,

```
EXECUTE 'UPDATE tbl SET '
|| quote_ident(colname)
|| ' = '
|| quote_nullable(newvalue)
|| ' WHERE key = '
|| quote_nullable(keyvalue);
```

If you are dealing with values that might be null, you should usually use quote_nullable in place of quote_literal.

As always, care must be taken to ensure that null values in a query do not deliver unintended results. For example the WHERE clause

```
'WHERE key = ' || quote_nullable(keyvalue)
```

will never succeed if keyvalue is null, because the result of using the equality operator = with a null operand is always null. If you wish null to work like an ordinary key value, you would need to rewrite the above as

```
'WHERE key IS NOT DISTINCT FROM ' || quote_nullable(keyvalue)
```

(At present, IS NOT DISTINCT FROM is handled much less efficiently than =, so don't do this unless you must.)

Note that dollar quoting is only useful for quoting fixed text. It would be a very bad idea to try to write this example as:

```
EXECUTE 'UPDATE tbl SET '
|| quote_ident(colname)
|| ' = $$'
        || newvalue
        || '$$ WHERE key = '
|| quote_literal(keyvalue);
```

because it would break if the contents of newvalue happened to contain $$. The same objection would apply to any other dollar-quoting delimiter you might pick. So, to safely quote text that is not known in advance, you must use quote_literal, quote_nullable, or quote_ident, as appropriate.

Dynamic SQL statements can also be safely constructed using the format function (see Section 9.4.1). For example:

```
EXECUTE format('UPDATE tbl SET %I = %L '
'WHERE key = %L', colname, newvalue, keyvalue);
```

%I is equivalent to quote_ident, and %L is equivalent to quote_nullable. The format function can be used in conjunction with the USING clause:

```
EXECUTE format('UPDATE tbl SET %I = $1 WHERE key = $2', colname)
USING newvalue, keyvalue;
```

This form is better because the variables are handled in their native data type format, rather than unconditionally converting them to text and quoting them via %L. It is also more efficient.

A much larger example of a dynamic command and EXECUTE can be seen in Example 43.10, which builds and executes a CREATE FUNCTION command to define a new function.

## Obtaining the Result Status

There are several ways to determine the effect of a command. The first method is to use the GET DIAGNOSTICS command, which has the form:

GET [ CURRENT ] DIAGNOSTICS variable { = | := } item [ , ... ];

This command allows retrieval of system status indicators. CURRENT is a noise word (but see also GET STACKED DIAGNOSTICS in Section 43.6.8.1). Each item is a key word identifying a status value to be assigned to the specified variable (which should be of the right data type to receive it). The currently available status items are shown in Table 43.1. Colon-equal (:=) can be used instead of the SQL-standard = token. An example:

GET DIAGNOSTICS integer_var = ROW_COUNT;

Table 43.1. Available Diagnostics Items
Name Type Description
ROW_COUNT bigint the number of rows processed by the most recent SQL command
PG_CONTEXT text line(s) of text describing the current call stack (see Section 43.6.9)

The second method to determine the effects of a command is to check the special variable named FOUND, which is of type boolean. FOUND starts out false within each PL/pgSQL function call. It is set by each of the following types of statements:

    A SELECT INTO statement sets FOUND true if a row is assigned, false if no row is returned.

    A PERFORM statement sets FOUND true if it produces (and discards) one or more rows, false if no row is produced.

    UPDATE, INSERT, DELETE, and MERGE statements set FOUND true if at least one row is affected, false if no row is affected.

    A FETCH statement sets FOUND true if it returns a row, false if no row is returned.

    A MOVE statement sets FOUND true if it successfully repositions the cursor, false otherwise.

    A FOR or FOREACH statement sets FOUND true if it iterates one or more times, else false. FOUND is set this way when the loop exits; inside the execution of the loop, FOUND is not modified by the loop statement, although it might be changed by the execution of other statements within the loop body.

    RETURN QUERY and RETURN QUERY EXECUTE statements set FOUND true if the query returns at least one row, false if no row is returned.

Other PL/pgSQL statements do not change the state of FOUND. Note in particular that EXECUTE changes the output of GET DIAGNOSTICS, but does not change FOUND.

FOUND is a local variable within each PL/pgSQL function; any changes to it affect only the current function.

## To do nothing in one arm of a logical expression

Sometimes a placeholder statement that does nothing is useful. For example, it can indicate that one arm of an if/then/else chain is deliberately empty. For this purpose, use the NULL statement:

For example, the following two fragments of code are equivalent:

```sql
BEGIN
y := x / 0;
EXCEPTION
WHEN division_by_zero THEN
NULL; -- ignore the error
END;

BEGIN
y := x / 0;
EXCEPTION
WHEN division_by_zero THEN -- ignore the error
END;
```

In Oracle's PL/SQL, empty statement lists are not allowed, and so NULL statements are required for situations such as this. PL/pgSQL allows you to just write nothing, instead.

Control structures are probably the most useful (and important) part of PL/pgSQL. With PL/pgSQL's control structures, you can manipulate PostgreSQL data in a very flexible and powerful way.

## To return a non set value from a function

`RETURN expression;`

RETURN with an expression terminates the function and returns the value of expression to the caller. This form is used for PL/pgSQL functions that do not return a set.

In a function that returns a scalar type, the expression's result will automatically be cast into the function's return type as described for assignments. But to return a composite (row) value, you must write an expression delivering exactly the requested column set. This may require use of explicit casting.

If you declared the function with output parameters, write just RETURN with no expression. The current values of the output parameter variables will be returned.

If you declared the function to return void, a RETURN statement can be used to exit the function early; but do not write an expression following RETURN.

The return value of a function cannot be left undefined. If control reaches the end of the top-level block of the function without hitting a RETURN statement, a run-time error will occur. This restriction does not apply to functions with output parameters and functions returning void, however. In those cases a RETURN statement is automatically executed if the top-level block finishes.

Some examples:

```sql
-- functions returning a scalar type
RETURN 1 + 2;
RETURN scalar_var;

-- functions returning a composite type
RETURN composite_type_var;
RETURN (1, 2, 'three'::text); -- must cast columns to correct types
```

## To return a set from a function

```sql
RETURN NEXT expression;
RETURN QUERY query;
RETURN QUERY EXECUTE command-string [ USING expression [, ... ] ];
```

When a PL/pgSQL function is declared to return SETOF sometype, the procedure to follow is slightly different. In that case, the individual items to return are specified by a sequence of RETURN NEXT or RETURN QUERY commands, and then a final RETURN command with no argument is used to indicate that the function has finished executing. RETURN NEXT can be used with both scalar and composite data types; with a composite result type, an entire “table” of results will be returned. RETURN QUERY appends the results of executing a query to the function's result set. RETURN NEXT and RETURN QUERY can be freely intermixed in a single set-returning function, in which case their results will be concatenated.

RETURN NEXT and RETURN QUERY do not actually return from the function — they simply append zero or more rows to the function's result set. Execution then continues with the next statement in the PL/pgSQL function. As successive RETURN NEXT or RETURN QUERY commands are executed, the result set is built up. A final RETURN, which should have no argument, causes control to exit the function (or you can just let control reach the end of the function).

RETURN QUERY has a variant RETURN QUERY EXECUTE, which specifies the query to be executed dynamically. Parameter expressions can be inserted into the computed query string via USING, in just the same way as in the EXECUTE command.

If you declared the function with output parameters, write just RETURN NEXT with no expression. On each execution, the current values of the output parameter variable(s) will be saved for eventual return as a row of the result. Note that you must declare the function as returning SETOF record when there are multiple output parameters, or SETOF sometype when there is just one output parameter of type sometype, in order to create a set-returning function with output parameters.

Here is an example of a function using RETURN NEXT:

```sql
CREATE TABLE foo (fooid INT, foosubid INT, fooname TEXT);
INSERT INTO foo VALUES (1, 2, 'three');
INSERT INTO foo VALUES (4, 5, 'six');

CREATE OR REPLACE FUNCTION get_all_foo() RETURNS SETOF foo AS
$BODY$
DECLARE
r foo%rowtype;
BEGIN
FOR r IN
SELECT \* FROM foo WHERE fooid > 0
LOOP
-- can do some processing here
RETURN NEXT r; -- return current row of SELECT
END LOOP;
RETURN;
END;
$BODY$
LANGUAGE plpgsql;

SELECT \* FROM get_all_foo();
```

Here is an example of a function using RETURN QUERY:

```sql
CREATE FUNCTION get_available_flightid(date) RETURNS SETOF integer AS
$BODY$
BEGIN
RETURN QUERY SELECT flightid
FROM flight
WHERE flightdate >= $1
AND flightdate < ($1 + 1);

    -- Since execution is not finished, we can check whether rows were returned
    -- and raise exception if not.
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No flight at %.', $1;
    END IF;

    RETURN;

END;
$BODY$
LANGUAGE plpgsql;

-- Returns available flights or raises exception if there are no
-- available flights.
SELECT \* FROM get_available_flightid(CURRENT_DATE);
```

The current implementation of RETURN NEXT and RETURN QUERY stores the entire result set before returning from the function, as discussed above. That means that if a PL/pgSQL function produces a very large result set, performance might be poor: data will be written to disk to avoid memory exhaustion, but the function itself will not return until the entire result set has been generated. A future version of PL/pgSQL might allow users to define set-returning functions that do not have this limitation. Currently, the point at which data begins being written to disk is controlled by the work_mem configuration variable. Administrators who have sufficient memory to store larger result sets in memory should consider increasing this parameter.

##  Conditionals

IF and CASE statements let you execute alternative commands based on certain conditions.

### IF-THEN

IF boolean-expression THEN
statements
END IF;

IF-THEN statements are the simplest form of IF. The statements between THEN and END IF will be executed if the condition is true. Otherwise, they are skipped.

Example:

```sql
IF v_user_id <> 0 THEN
UPDATE users SET email = v_email WHERE user_id = v_user_id;
END IF;
```

### IF-THEN-ELSE

IF boolean-expression THEN
statements
ELSE
statements
END IF;

IF-THEN-ELSE statements add to IF-THEN by letting you specify an alternative set of statements that should be executed if the condition is not true. (Note this includes the case where the condition evaluates to NULL.)

Examples:

```sql
IF parentid IS NULL OR parentid = ''
THEN
RETURN fullname;
ELSE
RETURN hp_true_filename(parentid) || '/' || fullname;
END IF;

IF v_count > 0 THEN
INSERT INTO users_count (count) VALUES (v_count);
RETURN 't';
ELSE
RETURN 'f';
END IF;
```

### IF-THEN-ELSIF

```sql
IF boolean-expression THEN
statements
[ ELSIF boolean-expression THEN
statements
[ ELSIF boolean-expression THEN
statements
...
]
]
[ ELSE
statements ]
END IF;
```

Sometimes there are more than just two alternatives. IF-THEN-ELSIF provides a convenient method of checking several alternatives in turn. The IF conditions are tested successively until the first one that is true is found. Then the associated statement(s) are executed, after which control passes to the next statement after END IF. (Any subsequent IF conditions are not tested.) If none of the IF conditions is true, then the ELSE block (if any) is executed.

Here is an example:

```sql
IF number = 0 THEN
result := 'zero';
ELSIF number > 0 THEN
result := 'positive';
ELSIF number < 0 THEN
result := 'negative';
ELSE
-- hmm, the only other possibility is that number is null
result := 'NULL';
END IF;
```

The key word ELSIF can also be spelled ELSEIF.

An alternative way of accomplishing the same task is to nest IF-THEN-ELSE statements, as in the following example:

```sql
IF demo_row.sex = 'm' THEN
pretty_sex := 'man';
ELSE
IF demo_row.sex = 'f' THEN
pretty_sex := 'woman';
END IF;
END IF;
```

However, this method requires writing a matching END IF for each IF, so it is much more cumbersome than using ELSIF when there are many alternatives.

### Simple CASE

```sql
CASE search-expression
WHEN expression [, expression [ ... ]] THEN
statements
[ WHEN expression [, expression [ ... ]] THEN
statements
... ]
[ ELSE
statements ]
END CASE;
```

The simple form of CASE provides conditional execution based on equality of operands. The search-expression is evaluated (once) and successively compared to each expression in the WHEN clauses. If a match is found, then the corresponding statements are executed, and then control passes to the next statement after END CASE. (Subsequent WHEN expressions are not evaluated.) If no match is found, the ELSE statements are executed; but if ELSE is not present, then a CASE_NOT_FOUND exception is raised.

Here is a simple example:

```sql
CASE x
WHEN 1, 2 THEN
msg := 'one or two';
ELSE
msg := 'other value than one or two';
END CASE;
```

### Searched CASE

```sql
CASE
WHEN boolean-expression THEN
statements
[ WHEN boolean-expression THEN
statements
... ]
[ ELSE
statements ]
END CASE;
```

The searched form of CASE provides conditional execution based on truth of Boolean expressions. Each WHEN clause's boolean-expression is evaluated in turn, until one is found that yields true. Then the corresponding statements are executed, and then control passes to the next statement after END CASE. (Subsequent WHEN expressions are not evaluated.) If no true result is found, the ELSE statements are executed; but if ELSE is not present, then a CASE_NOT_FOUND exception is raised.

Here is an example:

```sql
CASE
WHEN x BETWEEN 0 AND 10 THEN
msg := 'value is between zero and ten';
WHEN x BETWEEN 11 AND 20 THEN
msg := 'value is between eleven and twenty';
END CASE;
```

This form of CASE is entirely equivalent to IF-THEN-ELSIF, except for the rule that reaching an omitted ELSE clause results in an error rather than doing nothing.

## Simple Loops

With the LOOP, EXIT, CONTINUE, WHILE, FOR, and FOREACH statements, you can arrange for your PL/pgSQL function to repeat a series of commands.

### LOOP

```sql
[ <<label>> ]
LOOP
statements
END LOOP [ label ];
```

LOOP defines an unconditional loop that is repeated indefinitely until terminated by an EXIT or RETURN statement. The optional label can be used by EXIT and CONTINUE statements within nested loops to specify which loop those statements refer to.

### EXIT

`EXIT [ label ] [ WHEN boolean-expression ];`

If no label is given, the innermost loop is terminated and the statement following END LOOP is executed next. If label is given, it must be the label of the current or some outer level of nested loop or block. Then the named loop or block is terminated and control continues with the statement after the loop's/block's corresponding END.

If WHEN is specified, the loop exit occurs only if boolean-expression is true. Otherwise, control passes to the statement after EXIT.

EXIT can be used with all types of loops; it is not limited to use with unconditional loops.

When used with a BEGIN block, EXIT passes control to the next statement after the end of the block. Note that a label must be used for this purpose; an unlabeled EXIT is never considered to match a BEGIN block. (This is a change from pre-8.4 releases of PostgreSQL, which would allow an unlabeled EXIT to match a BEGIN block.)

Examples:

```sql
LOOP
-- some computations
IF count > 0 THEN
EXIT; -- exit loop
END IF;
END LOOP;

LOOP
-- some computations
EXIT WHEN count > 0; -- same result as previous example
END LOOP;

<<ablock>>
BEGIN
-- some computations
IF stocks > 100000 THEN
EXIT ablock; -- causes exit from the BEGIN block
END IF;
-- computations here will be skipped when stocks > 100000
END;
```

### CONTINUE

`CONTINUE [ label ] [ WHEN boolean-expression ];`

If no label is given, the next iteration of the innermost loop is begun. That is, all statements remaining in the loop body are skipped, and control returns to the loop control expression (if any) to determine whether another loop iteration is needed. If label is present, it specifies the label of the loop whose execution will be continued.

If WHEN is specified, the next iteration of the loop is begun only if boolean-expression is true. Otherwise, control passes to the statement after CONTINUE.

CONTINUE can be used with all types of loops; it is not limited to use with unconditional loops.

Examples:

```sql
LOOP
-- some computations
EXIT WHEN count > 100;
CONTINUE WHEN count < 50;
-- some computations for count IN [50 .. 100]
END LOOP;
```

### WHILE

```sql
[ <<label>> ]
WHILE boolean-expression LOOP
statements
END LOOP [ label ];
```

The WHILE statement repeats a sequence of statements so long as the boolean-expression evaluates to true. The expression is checked just before each entry to the loop body.

For example:

```sql
WHILE amount_owed > 0 AND gift_certificate_balance > 0 LOOP
-- some computations here
END LOOP;

WHILE NOT done LOOP
-- some computations here
END LOOP;
```

### FOR (Integer Variant)

[ <<label>> ]
FOR name IN [ REVERSE ] expression .. expression [ BY expression ] LOOP
statements
END LOOP [ label ];

This form of FOR creates a loop that iterates over a range of integer values. The variable name is automatically defined as type integer and exists only inside the loop (any existing definition of the variable name is ignored within the loop). The two expressions giving the lower and upper bound of the range are evaluated once when entering the loop. If the BY clause isn't specified the iteration step is 1, otherwise it's the value specified in the BY clause, which again is evaluated once on loop entry. If REVERSE is specified then the step value is subtracted, rather than added, after each iteration.

Some examples of integer FOR loops:

```sql
FOR i IN 1..10 LOOP
-- i will take on the values 1,2,3,4,5,6,7,8,9,10 within the loop
END LOOP;

FOR i IN REVERSE 10..1 LOOP
-- i will take on the values 10,9,8,7,6,5,4,3,2,1 within the loop
END LOOP;

FOR i IN REVERSE 10..1 BY 2 LOOP
-- i will take on the values 10,8,6,4,2 within the loop
END LOOP;
```

If the lower bound is greater than the upper bound (or less than, in the REVERSE case), the loop body is not executed at all. No error is raised.

If a label is attached to the FOR loop then the integer loop variable can be referenced with a qualified name, using that label.

### Looping through Query Results

Using a different type of FOR loop, you can iterate through the results of a query and manipulate that data accordingly. The syntax is:

[ <<label>> ]
FOR target IN query LOOP
statements
END LOOP [ label ];

The target is a record variable, row variable, or comma-separated list of scalar variables. The target is successively assigned each row resulting from the query and the loop body is executed for each row. Here is an example:

```sql
CREATE FUNCTION refresh_mviews() RETURNS integer AS

$$

DECLARE
mviews RECORD;
BEGIN
RAISE NOTICE 'Refreshing all materialized views...';

    FOR mviews IN
       SELECT n.nspname AS mv_schema,
              c.relname AS mv_name,
              pg_catalog.pg_get_userbyid(c.relowner) AS owner
         FROM pg_catalog.pg_class c
    LEFT JOIN pg_catalog.pg_namespace n ON (n.oid = c.relnamespace)
        WHERE c.relkind = 'm'
     ORDER BY 1
    LOOP

        -- Now "mviews" has one record with information about the materialized view

        RAISE NOTICE 'Refreshing materialized view %.% (owner: %)...',
                     quote_ident(mviews.mv_schema),
                     quote_ident(mviews.mv_name),
                     quote_ident(mviews.owner);
        EXECUTE format('REFRESH MATERIALIZED VIEW %I.%I', mviews.mv_schema, mviews.mv_name);
    END LOOP;

    RAISE NOTICE 'Done refreshing materialized views.';
    RETURN 1;

END;


$$

LANGUAGE plpgsql;
```

If the loop is terminated by an EXIT statement, the last assigned row value is still accessible after the loop.

The query used in this type of FOR statement can be any SQL command that returns rows to the caller: SELECT is the most common case, but you can also use INSERT, UPDATE, or DELETE with a RETURNING clause. Some utility commands such as EXPLAIN will work too.

PL/pgSQL variables are replaced by query parameters, and the query plan is cached for possible re-use, as discussed in detail in Section 43.11.1 and Section 43.11.2.

The FOR-IN-EXECUTE statement is another way to iterate over rows:

[ <<label>> ]
FOR target IN EXECUTE text_expression [ USING expression [, ... ] ] LOOP
statements
END LOOP [ label ];

This is like the previous form, except that the source query is specified as a string expression, which is evaluated and replanned on each entry to the FOR loop. This allows the programmer to choose the speed of a preplanned query or the flexibility of a dynamic query, just as with a plain EXECUTE statement. As with EXECUTE, parameter values can be inserted into the dynamic command via USING.

Another way to specify the query whose results should be iterated through is to declare it as a cursor.

### Looping through Arrays

The FOREACH loop is much like a FOR loop, but instead of iterating through the rows returned by an SQL query, it iterates through the elements of an array value. (In general, FOREACH is meant for looping through components of a composite-valued expression; variants for looping through composites besides arrays may be added in future.) The FOREACH statement to loop over an array is:

```
[ <<label>> ]
FOREACH target [ SLICE number ] IN ARRAY expression LOOP
statements
END LOOP [ label ];
```

Without SLICE, or if SLICE 0 is specified, the loop iterates through individual elements of the array produced by evaluating the expression. The target variable is assigned each element value in sequence, and the loop body is executed for each element. Here is an example of looping through the elements of an integer array:

```sql
CREATE FUNCTION sum(int[]) RETURNS int8 AS

$$

DECLARE
s int8 := 0;
x int;
BEGIN
FOREACH x IN ARRAY $1
LOOP
s := s + x;
END LOOP;
RETURN s;
END;


$$

LANGUAGE plpgsql;
```

The elements are visited in storage order, regardless of the number of array dimensions. Although the target is usually just a single variable, it can be a list of variables when looping through an array of composite values (records). In that case, for each array element, the variables are assigned from successive columns of the composite value.

With a positive SLICE value, FOREACH iterates through slices of the array rather than single elements. The SLICE value must be an integer constant not larger than the number of dimensions of the array. The target variable must be an array, and it receives successive slices of the array value, where each slice is of the number of dimensions specified by SLICE. Here is an example of iterating through one-dimensional slices:

```sql
CREATE FUNCTION scan_rows(int[]) RETURNS void AS

$$

DECLARE
x int[];
BEGIN
FOREACH x SLICE 1 IN ARRAY $1
LOOP
RAISE NOTICE 'row = %', x;
END LOOP;
END;


$$

LANGUAGE plpgsql;

SELECT scan_rows(ARRAY[[1,2,3],[4,5,6],[7,8,9],[10,11,12]]);

NOTICE: row = {1,2,3}
NOTICE: row = {4,5,6}
NOTICE: row = {7,8,9}
NOTICE: row = {10,11,12}
```

## Trapping Errors

By default, any error occurring in a PL/pgSQL function aborts execution of the function and the surrounding transaction. You can trap errors and recover from them by using a BEGIN block with an EXCEPTION clause. The syntax is an extension of the normal syntax for a BEGIN block:

```sql
[ <<label>> ]
[ DECLARE
declarations ]
BEGIN
statements
EXCEPTION
WHEN condition [ OR condition ... ] THEN
handler_statements
[ WHEN condition [ OR condition ... ] THEN
handler_statements
... ]
END;
```

If no error occurs, this form of block simply executes all the statements, and then control passes to the next statement after END. But if an error occurs within the statements, further processing of the statements is abandoned, and control passes to the EXCEPTION list. The list is searched for the first condition matching the error that occurred. If a match is found, the corresponding handler_statements are executed, and then control passes to the next statement after END. If no match is found, the error propagates out as though the EXCEPTION clause were not there at all: the error can be caught by an enclosing block with EXCEPTION, or if there is none it aborts processing of the function.

The condition names can be any of those shown in Appendix A. A category name matches any error within its category. The special condition name OTHERS matches every error type except QUERY_CANCELED and ASSERT_FAILURE. (It is possible, but often unwise, to trap those two error types by name.) Condition names are not case-sensitive. Also, an error condition can be specified by SQLSTATE code; for example these are equivalent:

WHEN division_by_zero THEN ...
WHEN SQLSTATE '22012' THEN ...

If a new error occurs within the selected handler_statements, it cannot be caught by this EXCEPTION clause, but is propagated out. A surrounding EXCEPTION clause could catch it.

When an error is caught by an EXCEPTION clause, the local variables of the PL/pgSQL function remain as they were when the error occurred, but all changes to persistent database state within the block are rolled back. As an example, consider this fragment:

```sql
INSERT INTO mytab(firstname, lastname) VALUES('Tom', 'Jones');
BEGIN
UPDATE mytab SET firstname = 'Joe' WHERE lastname = 'Jones';
x := x + 1;
y := x / 0;
EXCEPTION
WHEN division_by_zero THEN
RAISE NOTICE 'caught division_by_zero';
RETURN x;
END;
```

When control reaches the assignment to y, it will fail with a division_by_zero error. This will be caught by the EXCEPTION clause. The value returned in the RETURN statement will be the incremented value of x, but the effects of the UPDATE command will have been rolled back. The INSERT command preceding the block is not rolled back, however, so the end result is that the database contains Tom Jones not Joe Jones.
Tip

A block containing an EXCEPTION clause is significantly more expensive to enter and exit than a block without one. Therefore, don't use EXCEPTION without need.

### Exceptions with UPDATE/INSERT

This example uses exception handling to perform either UPDATE or INSERT, as appropriate. It is recommended that applications use INSERT with ON CONFLICT DO UPDATE rather than actually using this pattern. This example serves primarily to illustrate use of PL/pgSQL control flow structures:

```sql
CREATE TABLE db (a INT PRIMARY KEY, b TEXT);

CREATE FUNCTION merge_db(key INT, data TEXT) RETURNS VOID AS

$$

BEGIN
LOOP
-- first try to update the key
UPDATE db SET b = data WHERE a = key;
IF found THEN
RETURN;
END IF;
-- not there, so try to insert the key
-- if someone else inserts the same key concurrently,
-- we could get a unique-key failure
BEGIN
INSERT INTO db(a,b) VALUES (key, data);
RETURN;
EXCEPTION WHEN unique_violation THEN
-- Do nothing, and loop to try the UPDATE again.
END;
END LOOP;
END;


$$

LANGUAGE plpgsql;

SELECT merge_db(1, 'david');
SELECT merge_db(1, 'dennis');
```

This coding assumes the unique_violation error is caused by the INSERT, and not by, say, an INSERT in a trigger function on the table. It might also misbehave if there is more than one unique index on the table, since it will retry the operation regardless of which index caused the error. More safety could be had by using the features discussed next to check that the trapped error was the one expected.

### Obtaining Information about an Error

Exception handlers frequently need to identify the specific error that occurred. There are two ways to get information about the current exception in PL/pgSQL: special variables and the GET STACKED DIAGNOSTICS command.

Within an exception handler, the special variable SQLSTATE contains the error code that corresponds to the exception that was raised (refer to Table A.1 for a list of possible error codes). The special variable SQLERRM contains the error message associated with the exception. These variables are undefined outside exception handlers.

Within an exception handler, one may also retrieve information about the current exception by using the GET STACKED DIAGNOSTICS command, which has the form:

GET STACKED DIAGNOSTICS variable { = | := } item [ , ... ];

Each item is a key word identifying a status value to be assigned to the specified variable (which should be of the right data type to receive it). The currently available status items are shown in Table 43.2.

Table 43.2. Error Diagnostics Items
Name Type Description
RETURNED_SQLSTATE text the SQLSTATE error code of the exception
COLUMN_NAME text the name of the column related to exception
CONSTRAINT_NAME text the name of the constraint related to exception
PG_DATATYPE_NAME text the name of the data type related to exception
MESSAGE_TEXT text the text of the exception's primary message
TABLE_NAME text the name of the table related to exception
SCHEMA_NAME text the name of the schema related to exception
PG_EXCEPTION_DETAIL text the text of the exception's detail message, if any
PG_EXCEPTION_HINT text the text of the exception's hint message, if any
PG_EXCEPTION_CONTEXT text line(s) of text describing the call stack at the time of the exception (see Section 43.6.9)

If the exception did not set a value for an item, an empty string will be returned.

Here is an example:

```
DECLARE
text_var1 text;
text_var2 text;
text_var3 text;
BEGIN
-- some processing which might cause an exception
...
EXCEPTION WHEN OTHERS THEN
GET STACKED DIAGNOSTICS text_var1 = MESSAGE_TEXT,
text_var2 = PG_EXCEPTION_DETAIL,
text_var3 = PG_EXCEPTION_HINT;
END;
```

### Obtaining Execution Location Information

The GET DIAGNOSTICS command, previously described in Section 43.5.5, retrieves information about current execution state (whereas the GET STACKED DIAGNOSTICS command discussed above reports information about the execution state as of a previous error). Its PG_CONTEXT status item is useful for identifying the current execution location. PG_CONTEXT returns a text string with line(s) of text describing the call stack. The first line refers to the current function and currently executing GET DIAGNOSTICS command. The second and any subsequent lines refer to calling functions further up the call stack. For example:

```sql
CREATE OR REPLACE FUNCTION outer_func() RETURNS integer AS

$$

BEGIN
RETURN inner_func();
END;


$$

LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION inner_func() RETURNS integer AS

$$

DECLARE
stack text;
BEGIN
GET DIAGNOSTICS stack = PG_CONTEXT;
RAISE NOTICE E'--- Call Stack ---\n%', stack;
RETURN 1;
END;


$$

LANGUAGE plpgsql;

SELECT outer_func();

NOTICE: --- Call Stack ---
PL/pgSQL function inner_func() line 5 at GET DIAGNOSTICS
PL/pgSQL function outer_func() line 3 at RETURN
CONTEXT: PL/pgSQL function outer_func() line 3 at RETURN
outer_func

---

           1

(1 row)
```

GET STACKED DIAGNOSTICS ... PG_EXCEPTION_CONTEXT returns the same sort of stack trace, but describing the location at which an error was detected, rather than the current location.

separate it from the argument expression. Similar to calling functions, described in Section 4.3, it is also allowed to mix positional and named notation.

Examples (these use the cursor declaration examples above):

```
OPEN curs2;
OPEN curs3(42);
OPEN curs3(key := 42);
```

Because variable substitution is done on a bound cursor's query, there are really two ways to pass values into the cursor: either with an explicit argument to OPEN, or implicitly by referencing a PL/pgSQL variable in the query. However, only variables declared before the bound cursor was declared will be substituted into it. In either case the value to be passed is determined at the time of the OPEN. For example, another way to get the same effect as the curs3 example above is

```
DECLARE
key integer;
curs4 CURSOR FOR SELECT \* FROM tenk1 WHERE unique1 = key;
BEGIN
key := 42;
OPEN curs4;
```

## Using Cursors

Once a cursor has been opened, it can be manipulated with the statements described here.

These manipulations need not occur in the same function that opened the cursor to begin with. You can return a refcursor value out of a function and let the caller operate on the cursor. (Internally, a refcursor value is simply the string name of a so-called portal containing the active query for the cursor. This name can be passed around, assigned to other refcursor variables, and so on, without disturbing the portal.)

All portals are implicitly closed at transaction end. Therefore a refcursor value is usable to reference an open cursor only until the end of the transaction.

### FETCH

`FETCH [ direction { FROM | IN } ] cursor INTO target;`

FETCH retrieves the next row from the cursor into a target, which might be a row variable, a record variable, or a comma-separated list of simple variables, just like SELECT INTO. If there is no next row, the target is set to NULL(s). As with SELECT INTO, the special variable FOUND can be checked to see whether a row was obtained or not.

The direction clause can be any of the variants allowed in the SQL FETCH command except the ones that can fetch more than one row; namely, it can be NEXT, PRIOR, FIRST, LAST, ABSOLUTE count, RELATIVE count, FORWARD, or BACKWARD. Omitting direction is the same as specifying NEXT. In the forms using a count, the count can be any integer-valued expression (unlike the SQL FETCH command, which only allows an integer constant). direction values that require moving backward are likely to fail unless the cursor was declared or opened with the SCROLL option.

cursor must be the name of a refcursor variable that references an open cursor portal.

Examples:

```
FETCH curs1 INTO rowvar;
FETCH curs2 INTO foo, bar, baz;
FETCH LAST FROM curs3 INTO x, y;
FETCH RELATIVE -2 FROM curs4 INTO x;
```

### MOVE

MOVE [ direction { FROM | IN } ] cursor;

MOVE repositions a cursor without retrieving any data. MOVE works exactly like the FETCH command, except it only repositions the cursor and does not return the row moved to. As with SELECT INTO, the special variable FOUND can be checked to see whether there was a next row to move to.

Examples:

MOVE curs1;
MOVE LAST FROM curs3;
MOVE RELATIVE -2 FROM curs4;
MOVE FORWARD 2 FROM curs4;

### UPDATE/DELETE WHERE CURRENT OF

UPDATE table SET ... WHERE CURRENT OF cursor;
DELETE FROM table WHERE CURRENT OF cursor;

When a cursor is positioned on a table row, that row can be updated or deleted using the cursor to identify the row. There are restrictions on what the cursor's query can be (in particular, no grouping) and it's best to use FOR UPDATE in the cursor. For more information see the DECLARE reference page.

An example:

UPDATE foo SET dataval = myval WHERE CURRENT OF curs1;

### CLOSE

CLOSE cursor;

CLOSE closes the portal underlying an open cursor. This can be used to release resources earlier than end of transaction, or to free up the cursor variable to be opened again.

An example:

CLOSE curs1;

### Returning Cursors

PL/pgSQL functions can return cursors to the caller. This is useful to return multiple rows or columns, especially with very large result sets. To do this, the function opens the cursor and returns the cursor name to the caller (or simply opens the cursor using a portal name specified by or otherwise known to the caller). The caller can then fetch rows from the cursor. The cursor can be closed by the caller, or it will be closed automatically when the transaction closes.

The portal name used for a cursor can be specified by the programmer or automatically generated. To specify a portal name, simply assign a string to the refcursor variable before opening it. The string value of the refcursor variable will be used by OPEN as the name of the underlying portal. However, if the refcursor variable is null, OPEN automatically generates a name that does not conflict with any existing portal, and assigns it to the refcursor variable.
Note

A bound cursor variable is initialized to the string value representing its name, so that the portal name is the same as the cursor variable name, unless the programmer overrides it by assignment before opening the cursor. But an unbound cursor variable defaults to the null value initially, so it will receive an automatically-generated unique name, unless overridden.

The following example shows one way a cursor name can be supplied by the caller:

```sql
CREATE TABLE test (col text);
INSERT INTO test VALUES ('123');

CREATE FUNCTION reffunc(refcursor) RETURNS refcursor AS '
BEGIN
OPEN $1 FOR SELECT col FROM test;
RETURN $1;
END;
' LANGUAGE plpgsql;

BEGIN;
SELECT reffunc('funccursor');
FETCH ALL IN funccursor;
COMMIT;

The following example uses automatic cursor name generation:

CREATE FUNCTION reffunc2() RETURNS refcursor AS '
DECLARE
ref refcursor;
BEGIN
OPEN ref FOR SELECT col FROM test;
RETURN ref;
END;
' LANGUAGE plpgsql;

-- need to be in a transaction to use cursors.
BEGIN;
SELECT reffunc2();

      reffunc2

---

<unnamed cursor 1>
(1 row)

FETCH ALL IN "<unnamed cursor 1>";
COMMIT;

The following example shows one way to return multiple cursors from a single function:

CREATE FUNCTION myfunc(refcursor, refcursor) RETURNS SETOF refcursor AS
$$
BEGIN
OPEN $1 FOR SELECT _ FROM table_1;
RETURN NEXT $1;
OPEN $2 FOR SELECT _ FROM table_2;
RETURN NEXT $2;
END;
$$ LANGUAGE plpgsql;

-- need to be in a transaction to use cursors.
BEGIN;

SELECT \* FROM myfunc('a', 'b');

FETCH ALL FROM a;
FETCH ALL FROM b;
COMMIT;
```

### Looping through a Cursor's Result

There is a variant of the FOR statement that allows iterating through the rows returned by a cursor. The syntax is:

```W
[ <<label>> ]
FOR recordvar IN bound_cursorvar [ ( [ argument_name := ] argument_value [, ...] ) ] LOOP
statements
END LOOP [ label ];
```

The cursor variable must have been bound to some query when it was declared, and it cannot be open already. The FOR statement automatically opens the cursor, and it closes the cursor again when the loop exits. A list of actual argument value expressions must appear if and only if the cursor was declared to take arguments. These values will be substituted in the query, in just the same way as during an OPEN (see Section 43.7.2.3).

The variable recordvar is automatically defined as type record and exists only inside the loop (any existing definition of the variable name is ignored within the loop). Each row returned by the cursor is successively assigned to this record variable and the loop body is executed.

## How to manage transactions

In procedures invoked by the CALL command as well as in anonymous code blocks (DO command), it is possible to end transactions using the commands COMMIT and ROLLBACK. A new transaction is started automatically after a transaction is ended using these commands, so there is no separate START TRANSACTION command. (Note that BEGIN and END have different meanings in PL/pgSQL.)

Here is a simple example:

```sql
CREATE PROCEDURE transaction_test1()
LANGUAGE plpgsql
AS

$$

BEGIN
FOR i IN 0..9 LOOP
INSERT INTO test1 (a) VALUES (i);
IF i % 2 = 0 THEN
COMMIT;
ELSE
ROLLBACK;
END IF;
END LOOP;
END;


$$

;

CALL transaction_test1();
```

A new transaction starts out with default transaction characteristics such as transaction isolation level. In cases where transactions are committed in a loop, it might be desirable to start new transactions automatically with the same characteristics as the previous one. The commands COMMIT AND CHAIN and ROLLBACK AND CHAIN accomplish this.

Transaction control is only possible in CALL or DO invocations from the top level or nested CALL or DO invocations without any other intervening command. For example, if the call stack is CALL proc1() → CALL proc2() → CALL proc3(), then the second and third procedures can perform transaction control actions. But if the call stack is CALL proc1() → SELECT func2() → CALL proc3(), then the last procedure cannot do transaction control, because of the SELECT in between.

Special considerations apply to cursor loops. Consider this example:

```sql
CREATE PROCEDURE transaction_test2()
LANGUAGE plpgsql
AS

$$

DECLARE
r RECORD;
BEGIN
FOR r IN SELECT \* FROM test2 ORDER BY x LOOP
INSERT INTO test1 (a) VALUES (r.x);
COMMIT;
END LOOP;
END;


$$

;

CALL transaction_test2();
```

Normally, cursors are automatically closed at transaction commit. However, a cursor created as part of a loop like this is automatically converted to a holdable cursor by the first COMMIT or ROLLBACK. That means that the cursor is fully evaluated at the first COMMIT or ROLLBACK rather than row by row. The cursor is still removed automatically after the loop, so this is mostly invisible to the user.

Transaction commands are not allowed in cursor loops driven by commands that are not read-only (for example UPDATE ... RETURNING).

A transaction cannot be ended inside a block with exception handlers.

## How to report errors

Use the RAISE statement to report messages and raise errors.

```
RAISE [ level ] 'format' [, expression [, ... ]] [ USING option = expression [, ... ] ];
RAISE [ level ] condition_name [ USING option = expression [, ... ] ];
RAISE [ level ] SQLSTATE 'sqlstate' [ USING option = expression [, ... ] ];
RAISE [ level ] USING option = expression [, ... ];
RAISE ;
```

The level option specifies the error severity. Allowed levels are DEBUG, LOG, INFO, NOTICE, WARNING, and EXCEPTION, with EXCEPTION being the default. EXCEPTION raises an error (which normally aborts the current transaction); the other levels only generate messages of different priority levels. Whether messages of a particular priority are reported to the client, written to the server log, or both is controlled by the log_min_messages and client_min_messages configuration variables. See Chapter 20 for more information.

After level if any, you can specify a format string (which must be a simple string literal, not an expression). The format string specifies the error message text to be reported. The format string can be followed by optional argument expressions to be inserted into the message. Inside the format string, % is replaced by the string representation of the next optional argument's value. Write %% to emit a literal %. The number of arguments must match the number of % placeholders in the format string, or an error is raised during the compilation of the function.

In this example, the value of v_job_id will replace the % in the string:

`RAISE NOTICE 'Calling cs_create_job(%)', v_job_id;`

You can attach additional information to the error report by writing USING followed by option = expression items. Each expression can be any string-valued expression. The allowed option key words are:

MESSAGE

    Sets the error message text. This option can't be used in the form of RAISE that includes a format string before USING.

DETAIL

    Supplies an error detail message.

HINT

    Supplies a hint message.

ERRCODE

    Specifies the error code (SQLSTATE) to report, either by condition name, as shown in Appendix A, or directly as a five-character SQLSTATE code.

COLUMN
CONSTRAINT
DATATYPE
TABLE
SCHEMA

    Supplies the name of a related object.

This example will abort the transaction with the given error message and hint:

`RAISE EXCEPTION 'Nonexistent ID --> %', user_id`
`USING HINT = 'Please check your user ID';`

These two examples show equivalent ways of setting the SQLSTATE:

`RAISE 'Duplicate user ID: %', user_id USING ERRCODE = 'unique_violation';`
`RAISE 'Duplicate user ID: %', user_id USING ERRCODE = '23505';`

There is a second RAISE syntax in which the main argument is the condition name or SQLSTATE to be reported, for example:

`RAISE division_by_zero;`
`RAISE SQLSTATE '22012';`

In this syntax, USING can be used to supply a custom error message, detail, or hint. Another way to do the earlier example is

RAISE unique_violation USING MESSAGE = 'Duplicate user ID: ' || user_id;

Still another variant is to write RAISE USING or RAISE level USING and put everything else into the USING list.

The last variant of RAISE has no parameters at all. This form can only be used inside a BEGIN block's EXCEPTION clause; it causes the error currently being handled to be re-thrown.
Note

Before PostgreSQL 9.1, RAISE without parameters was interpreted as re-throwing the error from the block containing the active exception handler. Thus an EXCEPTION clause nested within that handler could not catch it, even if the RAISE was within the nested EXCEPTION clause's block. This was deemed surprising as well as being incompatible with Oracle's PL/SQL.

If no condition name nor SQLSTATE is specified in a RAISE EXCEPTION command, the default is to use ERRCODE_RAISE_EXCEPTION (P0001). If no message text is specified, the default is to use the condition name or SQLSTATE as message text.
Note

When specifying an error code by SQLSTATE code, you are not limited to the predefined error codes, but can select any error code consisting of five digits and/or upper-case ASCII letters, other than 00000. It is recommended that you avoid throwing error codes that end in three zeroes, because these are category codes and can only be trapped by trapping the whole category.

## How to check for bugs using assertions

The ASSERT statement is a convenient shorthand for inserting debugging checks into PL/pgSQL functions.

`ASSERT condition [ , message ];`

The condition is a Boolean expression that is expected to always evaluate to true; if it does, the ASSERT statement does nothing further. If the result is false or null, then an ASSERT_FAILURE exception is raised. (If an error occurs while evaluating the condition, it is reported as a normal error.)

If the optional message is provided, it is an expression whose result (if not null) replaces the default error message text “assertion failed”, should the condition fail. The message expression is not evaluated in the normal case where the assertion succeeds.

Testing of assertions can be enabled or disabled via the configuration parameter plpgsql.check_asserts, which takes a Boolean value; the default is on. If this parameter is off then ASSERT statements do nothing.

Note that ASSERT is meant for detecting program bugs, not for reporting ordinary error conditions. Use the RAISE statement, described above, for that.

## Triggers on Data Changes

PL/pgSQL can be used to define trigger functions on data changes or database events. A trigger function is created with the CREATE FUNCTION command, declaring it as a function with no arguments and a return type of trigger (for data change triggers) or event_trigger (for database event triggers). Special local variables named TG_something are automatically defined to describe the condition that triggered the call.

A data change trigger is declared as a function with no arguments and a return type of trigger. Note that the function must be declared with no arguments even if it expects to receive some arguments specified in CREATE TRIGGER — such arguments are passed via TG_ARGV, as described below.

When a PL/pgSQL function is called as a trigger, several special variables are created automatically in the top-level block. They are:

NEW

    Data type RECORD; variable holding the new database row for INSERT/UPDATE operations in row-level triggers. This variable is null in statement-level triggers and for DELETE operations.

OLD

    Data type RECORD; variable holding the old database row for UPDATE/DELETE operations in row-level triggers. This variable is null in statement-level triggers and for INSERT operations.

TG_NAME

    Data type name; variable that contains the name of the trigger actually fired.

TG_WHEN

    Data type text; a string of BEFORE, AFTER, or INSTEAD OF, depending on the trigger's definition.

TG_LEVEL

    Data type text; a string of either ROW or STATEMENT depending on the trigger's definition.

TG_OP

    Data type text; a string of INSERT, UPDATE, DELETE, or TRUNCATE telling for which operation the trigger was fired.

TG_RELID

    Data type oid; the object ID of the table that caused the trigger invocation.

TG_RELNAME

    Data type name; the name of the table that caused the trigger invocation. This is now deprecated, and could disappear in a future release. Use TG_TABLE_NAME instead.

TG_TABLE_NAME

    Data type name; the name of the table that caused the trigger invocation.

TG_TABLE_SCHEMA

    Data type name; the name of the schema of the table that caused the trigger invocation.

TG_NARGS

    Data type integer; the number of arguments given to the trigger function in the CREATE TRIGGER statement.

TG_ARGV[]

    Data type array of text; the arguments from the CREATE TRIGGER statement. The index counts from 0. Invalid indexes (less than 0 or greater than or equal to tg_nargs) result in a null value.

A trigger function must return either NULL or a record/row value having exactly the structure of the table the trigger was fired for.

Row-level triggers fired BEFORE can return null to signal the trigger manager to skip the rest of the operation for this row (i.e., subsequent triggers are not fired, and the INSERT/UPDATE/DELETE does not occur for this row). If a nonnull value is returned then the operation proceeds with that row value. Returning a row value different from the original value of NEW alters the row that will be inserted or updated. Thus, if the trigger function wants the triggering action to succeed normally without altering the row value, NEW (or a value equal thereto) has to be returned. To alter the row to be stored, it is possible to replace single values directly in NEW and return the modified NEW, or to build a complete new record/row to return. In the case of a before-trigger on DELETE, the returned value has no direct effect, but it has to be nonnull to allow the trigger action to proceed. Note that NEW is null in DELETE triggers, so returning that is usually not sensible. The usual idiom in DELETE triggers is to return OLD.

INSTEAD OF triggers (which are always row-level triggers, and may only be used on views) can return null to signal that they did not perform any updates, and that the rest of the operation for this row should be skipped (i.e., subsequent triggers are not fired, and the row is not counted in the rows-affected status for the surrounding INSERT/UPDATE/DELETE). Otherwise a nonnull value should be returned, to signal that the trigger performed the requested operation. For INSERT and UPDATE operations, the return value should be NEW, which the trigger function may modify to support INSERT RETURNING and UPDATE RETURNING (this will also affect the row value passed to any subsequent triggers, or passed to a special EXCLUDED alias reference within an INSERT statement with an ON CONFLICT DO UPDATE clause). For DELETE operations, the return value should be OLD.

The return value of a row-level trigger fired AFTER or a statement-level trigger fired BEFORE or AFTER is always ignored; it might as well be null. However, any of these types of triggers might still abort the entire operation by raising an error.

## How to trigger a function call on an event

PL/pgSQL can be used to define event triggers. PostgreSQL requires that a function that is to be called as an event trigger must be declared as a function with no arguments and a return type of event_trigger.

When a PL/pgSQL function is called as an event trigger, several special variables are created automatically in the top-level block. They are:

TG_EVENT

    Data type text; a string representing the event the trigger is fired for.

TG_TAG

    Data type text; variable that contains the command tag for which the trigger is fired.

This example trigger simply raises a NOTICE message each time a supported command is executed.

```sql
CREATE OR REPLACE FUNCTION snitch() RETURNS event_trigger AS
$$
BEGIN
RAISE NOTICE 'snitch: % %', tg_event, tg_tag;
END;
$$ LANGUAGE plpgsql;

CREATE EVENT TRIGGER snitch ON ddl_command_start EXECUTE FUNCTION snitch();
```

## How postgresql substitutes variables

Variable substitution can only insert data values into an SQL command; it cannot dynamically change which database objects are referenced by the command. (If you want to do that, you must build a command string dynamically)

A common coding rule is to use a different naming convention for PL/pgSQL variables than you use for column names. For example, if you consistently name function variables v*something while none of your column names start with v*, no conflicts will occur.

Variable substitution currently works only in SELECT, INSERT, UPDATE, DELETE, and commands containing one of these (such as EXPLAIN and CREATE TABLE ... AS SELECT), because the main SQL engine allows query parameters only in these commands. To use a non-constant name or value in other statement types (generically called utility statements), you must construct the utility statement as a string and EXECUTE it.

## How postgresql caches execution plan

The PL/pgSQL interpreter parses the function's source text and produces an internal binary instruction tree the first time the function is called (within each session). The instruction tree fully translates the PL/pgSQL statement structure, but individual SQL expressions and SQL commands used in the function are not translated immediately.

As each expression and SQL command is first executed in the function, the PL/pgSQL interpreter parses and analyzes the command to create a prepared statement, using the SPI manager's SPI_prepare function. Subsequent visits to that expression or command reuse the prepared statement. Thus, a function with conditional code paths that are seldom visited will never incur the overhead of analyzing those commands that are never executed within the current session. A disadvantage is that errors in a specific expression or command cannot be detected until that part of the function is reached in execution. (Trivial syntax errors will be detected during the initial parsing pass, but anything deeper will not be detected until execution.)

PL/pgSQL (or more precisely, the SPI manager) can furthermore attempt to cache the execution plan associated with any particular prepared statement. If a cached plan is not used, then a fresh execution plan is generated on each visit to the statement, and the current parameter values (that is, PL/pgSQL variable values) can be used to optimize the selected plan. If the statement has no parameters, or is executed many times, the SPI manager will consider creating a generic plan that is not dependent on specific parameter values, and caching that for re-use. Typically this will happen only if the execution plan is not very sensitive to the values of the PL/pgSQL variables referenced in it. If it is, generating a plan each time is a net win. See PREPARE for more information about the behavior of prepared statements.

Because PL/pgSQL saves prepared statements and sometimes execution plans in this way, SQL commands that appear directly in a PL/pgSQL function must refer to the same tables and columns on every execution; that is, you cannot use a parameter as the name of a table or column in an SQL command. To get around this restriction, you can construct dynamic commands using the PL/pgSQL EXECUTE statement — at the price of performing new parse analysis and constructing a new execution plan on every execution.

The mutable nature of record variables presents another problem in this connection. When fields of a record variable are used in expressions or statements, the data types of the fields must not change from one call of the function to the next, since each expression will be analyzed using the data type that is present when the expression is first reached. EXECUTE can be used to get around this problem when necessary.

If the same function is used as a trigger for more than one table, PL/pgSQL prepares and caches statements independently for each such table — that is, there is a cache for each trigger function and table combination, not just for each function. This alleviates some of the problems with varying data types; for instance, a trigger function will be able to work successfully with a column named key even if it happens to have different types in different tables.

Likewise, functions having polymorphic argument types have a separate statement cache for each combination of actual argument types they have been invoked for, so that data type differences do not cause unexpected failures.
