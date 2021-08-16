.PHONY: prod dev test testv testvv mypy pylint activate clean help

env:
	python3 -m venv env

activate: env
	. env/bin/activate

prod: activate .prod-reqs  ## Run production server (vengeful_vineyard.db)
	VENGEFUL_DATABASE="vengeful_vineyard.db" uvicorn app.main:app --host 0.0.0.0

dev: activate .dev-reqs    ## Run development server (dev.db)
	VENGEFUL_DATABASE="dev.db" uvicorn app.main:app

test: activate .dev-reqs  ## Run tests
	VENGEFUL_DATABASE=":memory:" pytest

testv: activate .dev-reqs  ## Run tests (verbose)
	VENGEFUL_DATABASE=":memory:" pytest -v

testvv: activate .dev-reqs  ## Run tests (very verbose)
	VENGEFUL_DATABASE=":memory:" pytest -vv

.prod-reqs: env            ## Install Python production requirements
	. env/bin/activate && pip install -r requirements.txt && touch .prod-reqs

.dev-reqs: env .prod-reqs  ## Install Python development requirements
	. env/bin/activate && pip install -r requirements-dev.txt &&  pre-commit install && touch .dev-reqs

pylint: activate   ## Python linter to check for common mistakes
	pylint app

mypy: activate     ## Typecheck Python code
	mypy --strict app tests

clean:             ## Clean up Python environment
	rm -rf env
	rm -f .dev-reqs .prod-reqs

help:     ## Show this help.
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
