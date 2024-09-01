FROM golang:1.22.2-slim
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY main.go .
RUN go build -o stock-publisher main.go
CMD ["./stock-publisher"]
#Testversuch