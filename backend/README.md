# Backend
Created with [FastAPI](https://fastapi.tiangolo.com) and SQLite.

## Structure
* `schema.sql`: Database schema
* app: The application
  * `main.py`: Definition of endpoints and routes
  * `config.json`: Configuration file
  * `db.py`: Database and CRUD
  * `models.py`: Pydantic models used for validation.
  * `types.py`: Custom types for better type checking.
* tests: Automatic tests
  * `database.py`: Database fixture
  * `test_*.py`: Testcases
