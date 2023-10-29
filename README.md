# Vengeful Vineyard

:wine_glass: Welcome to Vengeful Vineyard! :angry:

## Description

This project was created for the sole purpose of :boom: punishing members in the
student organization <i>Online Linjeforening</i> whenever they fail to perform
their respective tasks.

Their failure shall be documented on our page as a 'vinstraff' (wine punishment).
The old and outdated version can be found here: [RedWine](https://online.ntnu.no/redwine/).

## Project Status

Under development 🚧

## Frontend

### Built with

- [Typescript](https://www.typescriptlang.org/)
- [React](https://reactjs.org/)
- [Tailwind](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

### Installation and running locally

* `cd frontend`
* `pnpm i`
* `pnpm dev`


## Backend

Created with [FastAPI](https://fastapi.tiangolo.com) and PostgreSQL.

### (Recommended) Running locally with docker compose
* Make sure you have docker and docker compose installed.
* `cd backend`
* Start server with: `make dev`
* Go to: http://localhost:8000/docs for Swagger docs

## Contributing

Please take a look at our issues if you want to contribute to this project. Pull requests are welcome!

Before contributing, make sure to install pre-commit hooks with `pre-commit install`.

If you don't have `pre-commit` installed, you can install it with `pip install pre-commit` or `brew install pre-commit`

## Deploying changes
* Install AWS CLI
* `aws configure` - Get credentials from doppler: `monoweb/dev`
Install Docker engine

### Backend Deployment Instructions
* Log in to the private Amazon ECR repository `make docker-login` 
* Build the docker image from local code `make docker-build`
* Push the newly created docker image to Amazon ECR `make docker-push-dev`
* Inform lambda to fetch the new version of the image from ECR `make lambda-update-dev`

### Frontend Deployment Instructions
* Install doppler CLI
* Sign into doppler `doppler login`
* Setup doppler `doppler setup` (select `vengeful-vineyard`, `dev`)
* Build Vite export `doppler run pnpm build`
* Empty S3 bucket `aws s3 rm s3://dev.redwine-static.online.ntnu.no/ --recursive`
* Upload new dist `aws s3 cp dist s3://dev.redwine-static.online.ntnu.no/ --recursive`


