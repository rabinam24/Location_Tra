FROM node:20 AS build

WORKDIR /frontend

COPY package.json yarn.lock ./

# Replace 'minio-server' with the IP address of your MinIO server
RUN echo "192.168.1.100 minio-server" >> /etc/hosts

RUN yarn install

COPY . ./

RUN yarn build

FROM nginx:alpine

COPY --from=build /frontend/dist /usr/share/nginx/html
