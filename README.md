# Vengeful Vineyard

:wine_glass: Welcome to Vengeful Vineyard! :angry:

## Description

This project was created for the sole purpose of :boom: punishing members in the
student organization <i>Online Linjeforening</i> whenever they fail to perform
their respective tasks.

Their failure shall be documented on our page as a 'vinstraff' (wine punishment).
The old and outdated version can be found here: [RedWine](https://online.ntnu.no/redwine/).

## Project Status

The project is finished :tada:

It is currently being maintained by [Dotkom from the Online student association](https://online.ntnu.no/).

The link to the page is: [Vengeful Vineyard](https://vinstraff.no/)

## Tech Stack

### Frontend
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

### Backend
- [FastAPI](https://fastapi.tiangolo.com)
- PostgreSQL

---

## Getting Started (Local Development)

> **Note:** Running locally requires all three services: **Online Web (monoweb)**, **Backend**, and **Frontend**. The frontend authenticates users through Online Web, and requires the backend API to function.

### Prerequisites

Make sure you have the following installed:
- [Docker](https://www.docker.com/) and Docker Compose
- [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/)
- [Doppler CLI](https://docs.doppler.com/docs/install-cli)

### Step 1: Set up Doppler

We use [Doppler](https://docs.doppler.com) to manage secrets.

```bash
doppler login
doppler setup
# Select: vengeful-vineyard, dev
```

### Step 2: Set up Online Web (Authentication)

The frontend uses [Online Web (monoweb)](https://github.com/dotkom/monoweb) for user authentication. You need to run it locally.

1. Clone and set up monoweb by following the instructions at: https://github.com/dotkom/monoweb

2. To get started quickly with test data, run:
   ```bash
   doppler login
   doppler setup
   docker compose up -d
   pnpm install
   pnpm migrate:dev 
   pnpm vinstraff:user-db-sync
   pnpm dev
   ```

### Step 3: Start the Backend

The backend must be running before starting the frontend.

```bash
cd backend
make dev
```

This starts the FastAPI server with PostgreSQL using Docker Compose.

- API docs available at: http://localhost:8000/docs

#### Syncing Production Data (Optional)

If you have Doppler access to production, you can sync the production database to your local environment (while backend is running):

```bash
cd backend
make db-sync
```

### Step 4: Start the Frontend

```bash
cd frontend
pnpm install
doppler run pnpm dev
```

The frontend will be available at: http://localhost:5173 (or similar)

---

## Contributing

Please take a look at our issues if you want to contribute to this project. Pull requests are welcome!

Before contributing, make sure to install pre-commit hooks:

```bash
# Install pre-commit if you don't have it
pip install pre-commit
# or
brew install pre-commit

# Install the hooks
pre-commit install
```

---

## Deployment

To deploy changes to AWS, you need the AWS CLI installed and configured. Ask Dotkom for credentials to create an IAM user for you.

### AWS Setup

```bash
# Install AWS CLI, then configure
aws sso login --profile dotkom
```

### Backend Deployment

```bash
cd backend
make deploy-prod
# Or with profile:
make deploy-prod PROFILE=dotkom
```

Then go to the [Terraform monorepo](https://github.com/dotkom/infra) (`staging/vengeful-vineyard` or `prod/vengeful-vineyard` directory):

You will also need the `DOPPLER_TOKEN_ALL` token from [here](https://dashboard.doppler.com/workplace/7254af9f3ef6f40984fe/projects/terraform/configs/prod#TF_VAR_DOPPLER_TOKEN_ALL)

```bash
terraform init
# Or: AWS_PROFILE=dotkom terraform init

doppler run --project vengeful-vineyard --config prd -- terraform apply
# Or: AWS_PROFILE=dotkom doppler run --project vengeful-vineyard --config prd -- terraform apply

```

### Frontend Deployment

```bash
doppler login
doppler setup  # Select vengeful-vineyard, dev

cd frontend
pnpm run deploy:prod
# Or with profile:
pnpm run deploy:prod -- --profile=dotkom
```

---

## Troubleshooting

### Database Issues

If you encounter database issues, try resetting the local database:

```bash
cd backend
rm -rf postgres-data
docker-compose up --build
```

### Authentication Issues

Make sure Online Web (monoweb) is running on the expected port and that you're logged in there first before accessing Vengeful Vineyard.
