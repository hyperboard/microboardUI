# Database Migration to DrizzleORM.

This repository contains instructions for migrating a database to DrizzleORM using Docker containers.

## Steps:

### 1. Create a backup of the client database using the following command:

Update the `.env` file and the connection string to drizzle database for a successful migration.  
The dump file should be stored in the volume of your Docker database container. If you do not have a specific directory for the dump or the path to where it belongs, create one and store all backups in that location. The next time the container is deployed and the database is missing, the data will be retrieved from your storage.

<!-- Полный бэкап -->
```bash
docker exec `containerId` pg_dump -U `DbUser` -d `DbName` -p `DbPort` > ./backups/psql_db_dump.sql
```

<!-- Дамп только тех таблиц которые соответствуют шаблону board* (board1, board2, boards...) -->
```bash
docker exec `containerId` pg_dump -t 'board*' -U `DbUser` -d `DbName` -p `DbPort` > ./backups/psql_db_dump.sql
```

<!-- Дамп только данных -->
```bash
docker exec `containerId` pg_dump --inserts -U `DbUser` -d `DbName` -p `DbPort` > ./backups/psql_db_dump.sql
```

<!-- Наиболее подходящий вариант - первый, но в таком слуаче необходимо будет в ручную перебирать те данные которые нужно перенести на новую бд -->

After creating a backup, please check the file encoding. The encoding should be UTF-8. If it is not, please resave the file with UTF-8 encoding.

# Optional

### 2. Create a new database.

Log in to your database container and create drizzle database.

```bash
psql -h `DbHost` -p `DbPort` -U `DbUser`
```

```bash
CREATE DATABASE drizzle
```

Log to your new database and craete a new public schema if it's not exist.

```bash
CREATE SCHEMA public
```

### 3. Run the migration.

Get access to the test_app-1 container bash and run the migration:

```bash
`npm run migrate;`
```

# Some problems with db filling. 

Because backup contains some functions declarations and other stuff that you need to modarate by your hands. 
(Да можно делать дамп частичный, например выгрузить только inserts, но это тогда не решает проблемы с созданием динамических таблиц и sequences для них (потому что у них нет поля serial id, а просто integer id))

### 4. Fill the database with data from the client backup by running:  

```bash
docker exec -it `containerId` psql -U `DbUser` -d `DbName` -p `DbPort` -f docker-entrypoint-initdb.d/dump.sql
```

### 5. Create a new backup of the database after the migration using the following command:

```bash
docker exec `containerId` pg_dump -U `DbUser` -d `DbName` -p `DbPort` > ./src/Database.sql
```
