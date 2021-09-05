# Backend
Created with [FastAPI](https://fastapi.tiangolo.com) and SQLite.

## Development
* Start server with: `make dev`
* See `make help`

## Structure
* `schema.sql`: Database schema
* app: The application
  * `main.py`: Definition of endpoints and routes
  * `config.py`: Configuration file. Reads values from environment.
  * `db.py`: Database and CRUD
  * `models.py`: Pydantic models used for validation.
  * `types.py`: Custom types for better type checking.
* tests: Automatic tests
  * `database.py`: Database fixture
  * `test_*.py`: Testcases

## To be done
* Authentication: https://fastapi.tiangolo.com/tutorial/security
* SQL migrations
* Access control
* Write tests for this
