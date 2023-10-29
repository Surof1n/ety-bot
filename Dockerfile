FROM node:20

WORKDIR /app
COPY ./src .
COPY ./package-lock.json .
COPY ./package.json .
COPY ./tsconfig.json .
RUN npm ci

CMD [ "node" --loader ts-node/esm --experimental-specifier-resolution=node ./src/index.ts ]
