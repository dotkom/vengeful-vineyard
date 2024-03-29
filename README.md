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

- Install AWS CLI
- `aws configure` - Get credentials from doppler: `monoweb/dev`

### Backend Deployment Instructions

- `cd backend`
- `make deploy`

### Frontend Deployment Instructions

- `doppler login`
- `doppler setup` - (select vengeful-vineyard, dev)
- `cd frontend`
- `doppler run pnpm build`

### Debugging Tips

- Delete `/backend/postgres-data`
- `docker-compose up --build`
