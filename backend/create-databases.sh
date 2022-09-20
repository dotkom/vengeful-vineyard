#!/bin/bash

set -e
set -u

# names=`ls ./tests/test*.py`

# names=`ls ${PWD}/tests/test*.py`
names=`ls /tests/test*.py`
tomatch="class Test"
amount=0

for file in $names
do
    while read p;
    do
        if [[ $p == $tomatch* ]]
        then
            amount=$(( amount + 1 ))
        fi
    done < $file
done

function create_user_and_database() {
	local database=$1
	echo "  Creating user and database '$database'"
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
	    CREATE USER $database;
	    CREATE DATABASE $database;
	    GRANT ALL PRIVILEGES ON DATABASE $database TO $database;
EOSQL
}

echo $amount

if [ -n "$POSTGRES_DEFAULT_DATABASE_NAME" ]; then
	for i in $(seq 1 $amount); do
		create_user_and_database "${POSTGRES_DEFAULT_DATABASE_NAME}${i}"
		# echo "${POSTGRES_DEFAULT_DATABASE_NAME}${i}"
	done
fi

# if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
# 	echo "Multiple database creation requested: $POSTGRES_MULTIPLE_DATABASES"
# 	for db in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
# 		create_user_and_database $db
# 	done
# 	echo "Multiple databases created"
# fi
