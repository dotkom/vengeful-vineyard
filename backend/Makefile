.ONESHELL:
.PHONY: prod dev test testv testvv mypy pylint clean help hooks

prod: .prod-reqs
	VENGEFUL_DATABASE="vengeful_vineyard.db" poetry run uvicorn app.main:app --host 0.0.0.0

dev: .dev-reqs
	VENGEFUL_DATABASE="dev.db" poetry run uvicorn --reload --reload-dir app app.main:app

test: .dev-reqs
	VENGEFUL_DATABASE=":memory:" poetry run pytest

testv: .dev-reqs
	VENGEFUL_DATABASE=":memory:" poetry run pytest -v

testvv: .dev-reqs
	VENGEFUL_DATABASE=":memory:" poetry run pytest -vv

.prod-reqs:
	poetry install --no-root --no-dev && touch .prod-reqs

.dev-reqs: .prod-reqs
	poetry install --no-root && poetry run pre-commit install && touch .dev-reqs

pylint: .dev-reqs
	poetry run pylint app

mypy: .dev-reqs
	poetry run mypy --strict app tests

hooks: .dev-reqs
	poetry run pre-commit run -av

clean:
	rm -rf .mypy_cache
	rm -rf __pycache__
	rm -rf .pytest_cache
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
	@echo "hooks:	Run all commit hooks"
	@echo ""
	@echo "clean: 	Clean up Python environment"
