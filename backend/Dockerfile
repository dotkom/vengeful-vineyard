FROM python:3.9-alpine
ENV PYTHONUNBUFFERED=1
WORKDIR /app

RUN apk add --no-cache curl

COPY poetry.lock pyproject.toml create-databases.sh /app/
RUN apk add --no-cache gcc libffi-dev musl-dev postgresql-dev
RUN pip3 install poetry virtualenv
RUN poetry config virtualenvs.create false
RUN poetry install -n --no-ansi

COPY . /app

EXPOSE 8000

ENTRYPOINT poetry run uvicorn app.api.init_api:asgi_app --host 0.0.0.0
