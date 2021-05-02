run: env/touchfile
	source env/bin/activate && uvicorn app.main:app --reload --reload-dir app --host 0.0.0.0 --port 8888

env/touchfile: requirements.txt
	python3 -m venv env && source env/bin/activate && pip3 install -r requirements.txt; touch env/touchfile

testdb:
	rm database.db; ./scripts/populate_db.sh

test: env/touchfile
	source env/bin/activate && pytest

mypy: env/touchfile
	source env/bin/activate && mypy --strict app

clean:
	rm -rf env
