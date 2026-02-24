export SHELL:=/bin/bash
export SHELLOPTS:=$(if $(SHELLOPTS),$(SHELLOPTS):)pipefail:errexit

PROFILE ?= default

.ONESHELL:
.PHONY: prod dev dev-memory test testv testvv mypy pylint clean help hooks docs db-sync

prod: .prod-reqs
	VENGEFUL_DATABASE="vengeful_vineyard.db" poetry run uvicorn app.api.init_api:asgi_app --host 0.0.0.0
	# PROD NOT FOR USE

devv:
	docker compose up

dev:
	docker compose rm -f
	docker compose up

test:
	docker-compose rm -f
	docker-compose -f docker-compose.test.yml up --abort-on-container-exit

testv:
	docker-compose rm -f
	docker-compose -f docker-compose.test.yml -f docker-compose.testv.yml up --abort-on-container-exit

testvv:
	docker-compose rm -f
	docker-compose -f docker-compose.test.yml -f docker-compose.testvv.yml up --abort-on-container-exit

.prod-reqs:
	poetry install --no-root --no-prod && touch .prod-reqs

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

docker-build:
	docker build -f Dockerfile --platform linux/arm64 -t vengeful-vineyard-server:latest .

docker-push-prod:
	docker tag vengeful-vineyard-server:latest 891459268445.dkr.ecr.eu-north-1.amazonaws.com/vengeful-vineyard/prod/server:latest && docker push 891459268445.dkr.ecr.eu-north-1.amazonaws.com/vengeful-vineyard/prod/server:latest

docker-push-staging:
	docker tag vengeful-vineyard-server:latest 891459268445.dkr.ecr.eu-north-1.amazonaws.com/vengeful-vineyard/staging/server:latest && docker push 891459268445.dkr.ecr.eu-north-1.amazonaws.com/vengeful-vineyard/staging/server:latest

docker-login:
	aws ecr get-login-password --region eu-north-1 --profile $(PROFILE) | docker login --username AWS --password-stdin 891459268445.dkr.ecr.eu-north-1.amazonaws.com

deploy-prod: docker-build docker-login docker-push-prod

deploy-staging: docker-build docker-login docker-push-staging

db-sync:
	@echo "Syncing production database to local..."
	@echo "Step 1: Dumping production database..."
	doppler run --config prd -- sh -c 'PGPASSWORD="$$POSTGRES_PASSWORD" pg_dump -h "$$POSTGRES_HOST" -p "$$POSTGRES_PORT" -U "$$POSTGRES_USER" -d "$$POSTGRES_DB" --no-owner --no-acl' > /tmp/prod_dump.sql
	@echo "Step 2: Stopping app container..."
	docker compose stop app
	@echo "Step 3: Dropping and recreating local database..."
	docker compose exec db psql -U postgres -c "DROP DATABASE IF EXISTS dev;"
	docker compose exec db psql -U postgres -c "CREATE DATABASE dev;"
	@echo "Step 4: Loading production data into local database..."
	docker compose exec -T db psql -U postgres -d dev < /tmp/prod_dump.sql
	@echo "Step 5: Restarting containers..."
	docker compose up -d
	@echo "Done! Local database now contains production data."
	rm /tmp/prod_dump.sql

help:
	@echo "Makefile commands:"
	@echo "help:         Show this help."
	@echo ""
	@echo "prod:         Run production server (vengeful_vineyard.db)"
	@echo "dev:          Run development server (dev.db)"
	@echo ""
	@echo "docs:         Create documentation"
	@echo "test:         Run tests"
	@echo "testv:        Run tests (verbose)"
	@echo "testvv:       Run tests (very verbose)"
	@echo "pylint:       Python linter to check for common mistakes"
	@echo "mypy:         Typecheck Python code"
	@echo "hooks:        Run all commit hooks"
	@echo "docker-build: Build docker image for AWS Lambda"
	@echo "docker-login: Log in to Amazon ECR"
	@echo "docker-push-: Push the docker image to the specified environment (dev,stg,prd)"
	@echo ""
	@echo "db-sync:      Sync production database to local (requires Doppler access)"
	@echo "clean:        Clean up Python environment"
