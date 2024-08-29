FROM mcr.microsoft.com/devcontainers/go:1.21

RUN apt-get update && apt-get install -y apt-transport-https

RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
RUN echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list
RUN apt-get update && apt install -y docker-ce-cli

ENV GOPRIVATE=github.com/merzzzl

RUN go install github.com/golangci/golangci-lint/cmd/golangci-lint@v1.57.2
RUN go install mvdan.cc/gofumpt@v0.6.0
