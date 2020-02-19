FROM python:3

ENV PYTHONUNBUFFERED 1
ENV APP_DIR /srv/app

RUN mkdir ${APP_DIR}
WORKDIR ${APP_DIR}

RUN pip install --upgrade pip

COPY requirements.txt ${APP_DIR}/
RUN pip install -r requirements.txt

COPY . ${APP_DIR}/