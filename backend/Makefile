export SHELL:=/bin/bash
export SHELLOPTS:=$(if $(SHELLOPTS),$(SHELLOPTS):)pipefail:errexit

.ONESHELL:
.PHONY: prod dev dev-memory test testv testvv mypy pylint clean help hooks docs

prod: .prod-reqs
	VENGEFUL_DATABASE="vengeful_vineyard.db" poetry run uvicorn app.api.init_api:asgi_app --host 0.0.0.0

dev: .dev-reqs
	function tearDown {
		docker stop dev-db
	}
	trap tearDown EXIT
	docker run -d --rm --name dev-db -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=dev -v ${PWD}/postgres-data:/var/lib/postgresql/data postgres:11.3-alpine
	POSTGRES_DB=dev poetry run uvicorn --reload --reload-dir app app.api.init_api:asgi_app

dev-memory: .dev-reqs
	function tearDown {
		docker stop test-db
	}
	trap tearDown EXIT
	docker run -d --rm --name test-db -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=test postgres:11.3-alpine -c shared_buffers=500MB -c fsync=off
	POSTGRES_DB=test poetry run uvicorn --reload --reload-dir app app.api.init_api:asgi_app

test: .dev-reqs
	function tearDown {
		docker stop test-db
	}
	trap tearDown EXIT
	docker run -d --rm --name test-db -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=test postgres:11.3-alpine -c shared_buffers=500MB -c fsync=off
	POSTGRES_DB=test poetry run pytest --ignore=postgres-data --asyncio-mode=strict

testv: .dev-reqs
	function tearDown {
		docker stop test-db
	}
	trap tearDown EXIT
	docker run -d --rm --name test-db -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=test postgres:11.3-alpine -c shared_buffers=500MB -c fsync=off
	POSTGRES_DB=test poetry run pytest --ignore=postgres-data --asyncio-mode=strict -v --cov=app --cov-report term:skip-covered --cov-report html

testvv: .dev-reqs
	function tearDown {
		docker stop test-db
	}
	trap tearDown EXIT
	docker run -d --rm --name test-db -p 5432:5432 -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=test postgres:11.3-alpine -c shared_buffers=500MB -c fsync=off
	POSTGRES_DB=test poetry run pytest --ignore=postgres-data --asyncio-mode=strict -vv --cov=app --cov-report term:skip-covered --cov-report html

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
