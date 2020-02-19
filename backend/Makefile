

BACKEND_SERVICE = app

bash-backend:
	@docker-compose run --rm $(BACKEND_SERVICE) bash

build:
	@docker-compose build


clean:
	@docker-compose rm --force
	@docker volume prune --force

down:
	@docker-compose down


start:
	@docker-compose up -d
	@echo "Activate is running in a container now"

makemigrations:
	@docker-compose run --rm $(BACKEND_SERVICE) python manage.py makemigrations

migrate:
	@docker-compose run --rm $(BACKEND_SERVICE) python manage.py migrate

createsuperuser:
	@docker-compose run --rm $(BACKEND_SERVICE) python manage.py createsuperuser



lint:
	@docker-compose run --rm $(BACKEND_SERVICE) bash -c "black --check apps/ activate/ && flake8 apps/ "

lint-fix:
	@docker-compose run --rm $(BACKEND_SERVICE) black apps/

test:
	@docker-compose run --rm $(BACKEND_SERVICE) pytest apps/