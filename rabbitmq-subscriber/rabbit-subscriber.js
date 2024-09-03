const amqp = require('amqplib');

// Direkt im Skript definierte Verbindungsparameter
const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost';
const rabbitmqPort = process.env.RABBITMQ_PORT || 5672;
const rabbitmqUser = process.env.RABBITMQ_USER || 'stockmarket';
const rabbitmqPassword = process.env.RABBITMQ_PASSWORD || 'supersecret123';
const queueName = process.env.RABBITMQ_QUEUE || 'default_queue';

const buyMessages = [];
const sellMessages = [];

async function receiveMessage() {
    try {
        const connection = await amqp.connect({
            protocol: 'amqp',
            hostname: rabbitmqHost,
            port: rabbitmqPort,
            username: rabbitmqUser,
            password: rabbitmqPassword
        });

        const channel = await connection.createChannel();
        await channel.assertQueue(queueName, { durable: false });


        let totalMessages = 0;

        console.log(` [*] Waiting for messages in ${queueName}. To exit press CTRL+C`);

        channel.consume(queueName, (msg) => {
            if (msg !== null) {
                const content = JSON.parse(msg.content.toString());

                if (content.eventType === 'buy') {
                    buyMessages.push(content);
                } else if (content.eventType === 'sell') {
                    sellMessages.push(content);
                }

                totalMessages++;

                if (totalMessages === 1000) {
                    const averageBuyPrice = buyMessages.length > 0 ? buyMessages.reduce((acc, msg) => acc + msg.price, 0) / buyMessages.length : 0;
                    const averageSellPrice = sellMessages.length > 0 ? sellMessages.reduce((acc, msg) => acc + msg.price, 0) / sellMessages.length : 0;

                    console.log(` [x] Processed 1000 messages. Average buy price: ${averageBuyPrice}, Average sell price: ${averageSellPrice}`);

                    // saveToMongoDB(averageBuyPrice, averageSellPrice, buyMessages.length, sellMessages.length);
                    totalMessages = 0;
                    buyMessages.length = 0;
                    sellMessages.length = 0;
                }

                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('Error:', error);
    }

}

receiveMessage();
