BIN=env/bin
.ONESHELL:
.PHONY: prod dev test testv testvv mypy pylint clean help hooks

env:
	python3 -m venv env

prod: .prod-reqs
	VENGEFUL_DATABASE="vengeful_vineyard.db" $(BIN)/uvicorn app.main:app --host 0.0.0.0

dev: .dev-reqs
	VENGEFUL_DATABASE="dev.db" $(BIN)/uvicorn --reload --reload-dir app app.main:app

test: .dev-reqs
	VENGEFUL_DATABASE=":memory:" $(BIN)/pytest

testv: .dev-reqs
	VENGEFUL_DATABASE=":memory:" $(BIN)/pytest -v

testvv: .dev-reqs
	VENGEFUL_DATABASE=":memory:" $(BIN)/pytest -vv

.prod-reqs: env
	. env/bin/activate && pip install -r requirements.txt && touch .prod-reqs

.dev-reqs: env .prod-reqs
	. env/bin/activate && pip install -r requirements-dev.txt &&  pre-commit install && touch .dev-reqs

pylint: .dev-reqs
	$(BIN)/pylint app

mypy: .dev-reqs
	$(BIN)/mypy --strict app tests

hooks: .dev-reqs
	. env/bin/activate && pre-commit run -av

clean:
	rm -rf env
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
