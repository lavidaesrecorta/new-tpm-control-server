FROM node:16

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY /src ./src
COPY tsconfig.json ./tsconfig.json
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# If the NODE_ENV is "development", install additional dev dependencies
RUN if [ "$NODE_ENV" = "development" ]; then \
    yarn install --frozen-lockfile --production=false; \
    fi

# Expose the port on which the app will run (change it to your app's port if needed)
EXPOSE 3000

# Start the app
CMD ["yarn", "start"]
