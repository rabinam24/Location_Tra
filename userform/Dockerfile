# syntax=docker/dockerfile:1

# Use the official Go image based on version 1.22.4
FROM golang:1.22.4

# Set the working directory inside the container
WORKDIR /app

# Copy the Go modules files to the container
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code from the current directory to the container
COPY *.go ./

# Build the Go application statically
RUN CGO_ENABLED=0 GOOS=linux go build -o /docker-gs-ping

# Expose port 8080 to the outside world
EXPOSE 8080

# Command to run the executable
CMD ["/docker-gs-ping"]
