FROM node:18 AS site-builder
WORKDIR /app/site
COPY site/ .
RUN npm install
RUN npm run build

FROM golang:1.21.1 AS go-builder
WORKDIR /app
COPY . .
COPY --from=site-builder /app/site/build ./internal/server/embed/
RUN go build -o bin/app cmd/app/main.go

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=go-builder /app/bin/app /app/bin/app

ENV TOKEN=aviasales-token
EXPOSE 8080
CMD ["/app/bin/app"]
