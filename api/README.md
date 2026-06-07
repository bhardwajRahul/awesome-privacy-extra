
# Awesome Privacy API

The API allows you to consume the Awesome Privacy data pragmatically.
It also fetches and exposes additional data for each listing to add context.


## Usage
You are free to use the managed instance (`api.awesome-privacy.xyz`) however you like.
Or, run it locally or deploy your own instance by following the [Deployment](#deployment) steps below.

### Development
Start by cloning the repo `git clone git@github.com:lissy93/awesome-privacy.git` then `cd awesome-privacy/api`

1. `bun install` - Install dependencies
2. `bun run build:data` - Build the data from `awesome-privacy.yml`
3. `bun run dev` - Start the development server (then open `http://localhost:8787`)

Or, to build + run the Docker container, use:
1. `docker build -t awesome-privacy-api .`
2. `docker run -p 8787:8787 --env-file .env awesome-privacy-api`

### Deployment

#### Option 1: Docker

`docker run lissy93/awesome-privacy-api`

#### Option 2: Bare Metal
Follow the [development](#development) setup above, then run `bun start` to start the production server on `:8787`

#### Option 3: Cloudflare
