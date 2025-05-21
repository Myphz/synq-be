# SYNQ

SYNQ is the next-gen real-time cyberpunk instant messaging app.

This project was kickstarted using [Typescript Express Starter](https://github.com/Myphz/ts-express-starter).

## Template

This is a simple Express template with some libraries already installed and configured, including:

- TS Config
- Eslint
- Prettier
- Dockerfile
- Basic middlewares
- Zod params parsing
- Telegram error logging
- Fly.io config
- Github Actions for automatic deploy

## Configure

- Run `npx npm-check-updates -u && npm i` to update all libraries
- Copy `.env.example` to `.env`
- Change project name in `package.json` (used for telegram logging)
- Disable testing (optional)
- Set new git origin

### Deployment

- Change Github Action branch name in `.github/workflows/fly.yml`
- Set app name in `fly.toml` file
- Deploy the app with `fly launch`
- Set `.env` vars as fly secrets using `fly secrets set NAME=VALUE`
- Create fly.io token with `fly tokens create deploy -x 999999h` and set it as Github actions secret, named `FLY_API_TOKEN`
