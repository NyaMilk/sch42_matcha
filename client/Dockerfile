FROM node:12-alpine as builder
WORKDIR /app
COPY package.json /app/package.json
RUN yarn install
COPY . /app
RUN npm run build
FROM nginx:1.16.0-alpine
COPY --from=builder /app/build /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]