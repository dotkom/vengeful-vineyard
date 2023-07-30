FROM python:3.9-alpine
ENV PYTHONUNBUFFERED=1
WORKDIR /app
COPY poetry.lock pyproject.toml create-databases.sh /app/
RUN apk add --no-cache gcc libffi-dev musl-dev postgresql-dev
RUN pip3 install poetry virtualenv
RUN poetry config virtualenvs.create false
RUN poetry install -n --no-ansi
