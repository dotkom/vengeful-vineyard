.PHONY: prod dev test prod-reqs dev-reqs

prod:
	VENGEFUL_DATABASE="vengeful_vineyard.db" uvicorn app.main:app --host 0.0.0.0

dev:
	VENGEFUL_DATABASE="dev.db" uvicorn app.main:app --host 0.0.0.0

test:
	VENGEFUL_DATABASE=":memory:" pytest

testv:
	VENGEFUL_DATABASE=":memory:" pytest -v

prod-reqs:
	pip install --user -r requirements.txt

dev-reqs:
	pip install --user -r requirements-dev.txt

mypy:
	mypy --strict .
