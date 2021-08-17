.PHONY: prod dev test testv testvv mypy pylint activate clean help

env:
	python3 -m venv env

activate: env
	. env/bin/activate

prod: activate .prod-reqs
	VENGEFUL_DATABASE="vengeful_vineyard.db" uvicorn app.main:app --host 0.0.0.0

dev: activate .dev-reqs
	VENGEFUL_DATABASE="dev.db" uvicorn --reload --reload-dir app app.main:app

test: activate .dev-reqs
	VENGEFUL_DATABASE=":memory:" pytest

testv: activate .dev-reqs
	VENGEFUL_DATABASE=":memory:" pytest -v

testvv: activate .dev-reqs
	VENGEFUL_DATABASE=":memory:" pytest -vv

.prod-reqs: env
	. env/bin/activate && pip install -r requirements.txt && touch .prod-reqs

.dev-reqs: env .prod-reqs
	. env/bin/activate && pip install -r requirements-dev.txt &&  pre-commit install && touch .dev-reqs

pylint: activate
	pylint app

mypy: activate
	mypy --strict app tests

clean:
	rm -rf env
	rm -f .dev-reqs .prod-reqs

help:
	@echo "Makefile commands:"
	@echo "help:  	Show this help."
	@echo ""
	@echo "prod:  	Run production server (vengeful_vineyard.db)"
	@echo "dev:   	Run development server (dev.db)"
	@echo ""
	@echo "test:  	Run tests"
	@echo "testv: 	Run tests (verbose)"
	@echo "testvv:	Run tests (very verbose)"
	@echo "pylint:	Python linter to check for common mistakes"
	@echo "mypy:  	Typecheck Python code"
	@echo ""
	@echo "clean: 	Clean up Python environment"
