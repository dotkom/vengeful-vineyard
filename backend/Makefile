export SHELL:=/bin/bash
export SHELLOPTS:=$(if $(SHELLOPTS),$(SHELLOPTS):)pipefail:errexit

.ONESHELL:
.PHONY: prod dev dev-memory test testv testvv mypy pylint clean help hooks docs

prod: .prod-reqs
	VENGEFUL_DATABASE="vengeful_vineyard.db" poetry run uvicorn app.api.init_api:asgi_app --host 0.0.0.0
	# PROD NOT FOR USE

devv:
	docker-compose up

dev:
	docker-compose rm -f
	docker-compose up

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
	docker build -f Dockerfile --platform linux/amd64 -t vengeful-vineyard-server:latest .

docker-push-prod:
	docker tag vengeful-vineyard-server:latest 891459268445.dkr.ecr.eu-north-1.amazonaws.com/vengeful-server-prod:0.2.2 && docker push 891459268445.dkr.ecr.eu-north-1.amazonaws.com/vengeful-server-prod:0.2.2

docker-push-staging:
	docker tag vengeful-vineyard-server:latest 891459268445.dkr.ecr.eu-north-1.amazonaws.com/vengeful-server-staging:0.2.2 && docker push 891459268445.dkr.ecr.eu-north-1.amazonaws.com/vengeful-server-staging:0.2.2

docker-login:
	aws ecr get-login-password --region eu-north-1 | docker login --username AWS --password-stdin 891459268445.dkr.ecr.eu-north-1.amazonaws.com

lightsail-redeploy-staging:
	./lightsail-deploy-staging.sh

wait-for-lightsail-staging:
	./wait-for-lightsail-deploy-staging.sh

lightsail-redeploy-prod:
	./lightsail-deploy-prod.sh

wait-for-lightsail-prod:
	./wait-for-lightsail-deploy-prod.sh

deploy-prod: docker-build docker-login docker-push-prod lightsail-redeploy-prod wait-for-lightsail-prod

deploy-staging: docker-build docker-login docker-push-staging lightsail-redeploy-staging wait-for-lightsail-staging

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
	@echo "docker-build: Build docker image for AWS Lambda
	@echo "docker-login: Log in to Amazon ECR
	@echo "docker-push-: Push the docker image to the specified environment (dev,stg,prd)
	@echo ""
	@echo "clean:   Clean up Python environment"
