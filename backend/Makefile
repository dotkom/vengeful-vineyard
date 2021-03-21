run:
	source env/bin/activate && uvicorn app.main:app --reload --reload-dir app --host 0.0.0.0 --port 8888

pip:
	python3 -m venv env && source env/bin/activate && pip3 install -r requirements.txt

testdb:
	rm database.db; ./scripts/populate_db.sh

test:
	pytest
