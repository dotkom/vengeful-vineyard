.PHONY: prod dev test prod-reqs dev-reqs activate

env:
	python3 -m venv env && make prod-reqs && make dev-reqs

activate: env
	. env/bin/activate

prod: activate
	VENGEFUL_DATABASE="vengeful_vineyard.db" uvicorn app.main:app --host 0.0.0.0

dev: activate
	VENGEFUL_DATABASE="dev.db" uvicorn app.main:app

test: activate
	VENGEFUL_DATABASE=":memory:" pytest

testv: activate
	VENGEFUL_DATABASE=":memory:" pytest -v

testvv: activate
	VENGEFUL_DATABASE=":memory:" pytest -vv

prod-reqs: activate
	pip install --user -r requirements.txt

dev-reqs: activate
	pip install --user -r requirements-dev.txt

mypy: activate
	mypy --strict .
