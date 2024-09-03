const amqp = require('amqplib');

// Direkt im Skript definierte Verbindungsparameter
const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost';
const rabbitmqPort = process.env.RABBITMQ_PORT || 5672;
const rabbitmqUser = process.env.RABBITMQ_USER || 'stockmarket';
const rabbitmqPassword = process.env.RABBITMQ_PASSWORD || 'supersecret123';
const queueName = process.env.RABBITMQ_QUEUE || 'default_queue';

async function receiveMessage() {
    try {
        // Verbindung zu RabbitMQ herstellen
        const connection = await amqp.connect({
            protocol: 'amqp',
            hostname: rabbitmqHost,
            port: rabbitmqPort,
            username: rabbitmqUser,
            password: rabbitmqPassword
        });

        const channel = await connection.createChannel();

        // Queue deklarieren (wird erstellt, wenn sie nicht existiert)
        await channel.assertQueue(queueName, {
            durable: false
        });

        console.log(` [*] Waiting for messages in ${queueName}. To exit press CTRL+C`);

        // Nachricht empfangen
        channel.consume(queueName, (msg) => {
            if (msg !== null) {
                console.log(` [x] Received: ${msg.content.toString()}`);
                // Nachricht bestätigen (acknowledge)
                channel.ack(msg);
            }
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

receiveMessage();
