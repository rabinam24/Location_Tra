FROM golang:1.22.4

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY *.go ./
COPY wait-for-it.sh /usr/local/bin/wait-for-it.sh
RUN chmod +x /usr/local/bin/wait-for-it.sh

RUN CGO_ENABLED=0 GOOS=linux go build -o /docker-gs-ping

EXPOSE 8080

CMD ["wait-for-it.sh", "db:5432", "--", "/docker-gs-ping"]
