FROM public.ecr.aws/lambda/python:3.11

WORKDIR ${LAMBDA_TASK_ROOT}

COPY pyproject.toml poetry.lock ${LAMBDA_TASK_ROOT}/

RUN yum install -y gcc

RUN pip install poetry==1.6.1

ENV POETRY_NO_INTERACTION=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache

RUN poetry config virtualenvs.create false --local
RUN poetry install --only main --no-interaction --no-ansi

COPY app ${LAMBDA_TASK_ROOT}/app
COPY lambda.py ${LAMBDA_TASK_ROOT}/

CMD ["lambda.handler"]
