---
title: MySQL Database Character Encoding
date: 2017-05-07T15:40:00+02:00
categories: [log]
tags: [devops]
---
Query to show MySQL database character encoding:

```sql
SELECT default_character_set_name FROM information_schema.SCHEMATA S WHERE schema_name = "db_name";
```

Create a new MySQL database with specified character encoding:

```sql
CREATE DATABASE db_name CHARACTER SET utf8 COLLATE utf8_general_ci;

/* To support emoji! */
CREATE DATABASE db_name CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```

Query to change MySQL database character encoding:

```sql
ALTER DATABASE db_name CHARACTER SET utf8 COLLATE utf8_general_ci;

ALTER DATABASE db_name CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
```