FROM nginx:alpine
RUN mkdir -p bjs-client-worker
WORKDIR bjs-client-worker
ADD . .
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
