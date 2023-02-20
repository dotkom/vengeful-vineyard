export SHELL:=/bin/bash
export SHELLOPTS:=$(if $(SHELLOPTS),$(SHELLOPTS):)pipefail:errexit

.ONESHELL:
.PHONY: prod dev dev-memory test testv testvv mypy pylint clean help hooks docs

prod: .prod-reqs
	VENGEFUL_DATABASE="vengeful_vineyard.db" poetry run uvicorn app.api.init_api:asgi_app --host 0.0.0.0
	# PROD NOT FOR USE

devv:
	docker-compose up

dev: .dev-reqs
	docker-compose rm -f
	docker-compose up

test: .dev-reqs
	docker-compose rm -f
	docker-compose -f docker-compose.test.yml up --abort-on-container-exit

testv: .dev-reqs
	docker-compose rm -f
	docker-compose -f docker-compose.test.yml -f docker-compose.testv.yml up --abort-on-container-exit

testvv: .dev-reqs
	docker-compose rm -f
	docker-compose -f docker-compose.test.yml -f docker-compose.testvv.yml up --abort-on-container-exit

.prod-reqs:
	poetry install --no-root --no-dev && touch .prod-reqs

.dev-reqs: .prod-reqs
	poetry install --no-root && poetry run pre-commit install && touch .dev-reqs

pylint: .dev-reqs
	poetry run pylint app

mypy: .dev-reqs
	poetry run mypy --strict app tests

hooks: .dev-reqs
	poetry run pre-commit run -a

hooksv: .dev-reqs
	poetry run pre-commit run -av

clean:
	rm -rf .mypy_cache
	rm -rf __pycache__
	rm -rf .pytest_cache
	rm -f .dev-reqs .prod-reqs
	rm -r html

docs:
	poetry run pdoc3 --html --force .

help:
	@echo "Makefile commands:"
	@echo "help:    Show this help."
	@echo ""
	@echo "prod:    Run production server (vengeful_vineyard.db)"
	@echo "dev:     Run development server (dev.db)"
	@echo ""
	@echo "docs:    Create documentation"
	@echo "test:    Run tests"
	@echo "testv:   Run tests (verbose)"
	@echo "testvv:  Run tests (very verbose)"
	@echo "pylint:  Python linter to check for common mistakes"
	@echo "mypy:    Typecheck Python code"
	@echo "hooks:   Run all commit hooks"
	@echo ""
	@echo "clean:   Clean up Python environment"
