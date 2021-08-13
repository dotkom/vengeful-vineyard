.PHONY: prod dev test testv testvv mypy activate

env:
	python3 -m venv env

activate: env
	. env/bin/activate

prod: activate .prod-reqs
	VENGEFUL_DATABASE="vengeful_vineyard.db" uvicorn app.main:app --host 0.0.0.0

dev: activate .dev-reqs
	VENGEFUL_DATABASE="dev.db" uvicorn app.main:app

test: activate .dev-reqs
	VENGEFUL_DATABASE=":memory:" pytest

testv: activate .dev-reqs
	VENGEFUL_DATABASE=":memory:" pytest -v

testvv: activate .dev-reqs
	VENGEFUL_DATABASE=":memory:" pytest -vv

.prod-reqs:
	. env/bin/activate && pip install -r requirements.txt && touch .prod-reqs

.dev-reqs:
	. env/bin/activate && pip install -r requirements-dev.txt && touch .dev-reqs

mypy: activate .dev-reqs
	mypy --strict .

clean:
	rm -rf env
	rm -f .dev-reqs .prod-reqs
