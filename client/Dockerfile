FROM nginx:alpine
RUN mkdir -p bjs-client
WORKDIR bjs-client
ADD . .
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
