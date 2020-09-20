# Vengeful Vineyard

## Installation

```bash
npm install
```

## Run dev server

```bash
npm run dev
```
Navigate to [localhost:5000](http://localhost:5000).
By default, the server will only respond to requests from localhost. To allow connections from other computers, edit the `sirv` commands in package.json to include the option `--host 0.0.0.0`.

## Building and running in production mode

To create an optimised version of the app:

```bash
npm run build
```
You can run the newly built app with `npm run start`.
