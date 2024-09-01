FROM golang:1.20-alpine
WORKDIR /app
COPY main.go .
RUN go build -o stock-publisher main.go
CMD ["./stock-publisher"]
