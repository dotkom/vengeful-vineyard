# Vengeful Vineyard

:wine_glass: Welcome to Vengeful Vineyard! :angry:

## Description

This project was created for the sole purpose of :boom: punishing members in the
student organization <i>Online Linjeforening</i> whenever they fail to perform
their respective tasks.

Their failure shall be documented on our page as a 'vinstraff' (wine punishment).
The old and outdated version can be found here: [RedWine](https://online.ntnu.no/redwine/).

## Project Status

The project is is finished🎉
It is currently being maintained by [Dotkom from the Online student association](https://online.ntnu.no/).

The link to the page is: [Vengeful Vineyard](https://vinstraff.no/)

## Frontend

### Built with

- [Typescript](https://www.typescriptlang.org/)
- [React](https://reactjs.org/)
- [Tailwind](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

### Doppler

We use [Doppler](https://docs.doppler.com) to manage secrets. After installation, set up using:

- `doppler login`
- `doppler setup`
  - (select vengeful-vineyard, dev)

### Installation and running locally

- `cd frontend`
- `pnpm i`
- `doppler run pnpm dev`

## Backend

Created with [FastAPI](https://fastapi.tiangolo.com) and PostgreSQL.

#### (Recommended) Running locally with docker compose

- Make sure you have docker and docker compose installed.
- `cd backend`
- Start server with: `make dev`
- Go to: http://localhost:8000/docs for Swagger docs

## Contributing

Please take a look at our issues if you want to contribute to this project. Pull requests are welcome!

Before contributing, make sure to install pre-commit hooks with `pre-commit install`.

If you don't have `pre-commit` installed, you can install it with `pip install pre-commit` or `brew install pre-commit`

## Deploying changes

Do deploy changes to the aws. You will need to have the AWS CLI installed and set up.
First ask dotkom for credentials so that they can create a IAM user for you. Then do the following steps:

- Install AWS CLI
- Then run `aws configure' in the terminal
  - Optional: Set up a new profile for the project
  - Instead run `aws configure --profile dotkom`

### Backend Deployment Instructions

Note: You will need to have jq installed.

- `cd backend`
- `make deploy-prod`
  - Optionally if you are having profiles set up, you can run `make deploy-prod PROFILE=dotkom`

### Frontend Deployment Instructions
Note: You will need to have the Doppler CLI installed and set up.

- `doppler login`
- `doppler setup` - (select vengeful-vineyard, dev)
- `cd frontend`
- `npm run deploy:prod`
  - Optionallly if you are having profiles set up, you can run `npm run deploy:prd -- --profile dotkom`

### Debugging Tips

- Delete `/backend/postgres-data`
- `docker-compose up --build`
