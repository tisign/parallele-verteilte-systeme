const amqp = require('amqplib');
const { MongoClient } = require('mongodb');

const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost';
const rabbitmqPort = process.env.RABBITMQ_PORT || 5672;
const rabbitmqUser = process.env.RABBITMQ_USER || 'stockmarket';
const rabbitmqPassword = process.env.RABBITMQ_PASSWORD || 'supersecret123';
const queueName = process.env.RABBITMQ_QUEUE || 'default_queue';

const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017,localhost:27018,localhost:27019/?replicaSet=rs0';
const mongodbDatabase = process.env.MONGODB_DATABASE || 'stock-db';
const mongodbCollection = process.env.RABBITMQ_QUEUE || 'UNASSIGNED';

const buyMessages = [];
const sellMessages = [];

async function receiveMessage() {
    let client;
    try {
        client = new MongoClient(mongodbUri);
        await client.connect();
        const database = client.db(mongodbDatabase);
        const collection = database.collection(mongodbCollection);
        console.log('Connected to MongoDB');


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

        channel.consume(queueName, async (msg) => {
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

                    await saveToMongoDB(collection, averageBuyPrice, averageSellPrice, buyMessages.length, sellMessages.length);

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

async function saveToMongoDB(collection, averageBuyPrice, averageSellPrice, buyCount, sellCount) {
    try {
        const result = await collection.insertOne({
            averageBuyPrice: averageBuyPrice,
            averageSellPrice: averageSellPrice,
            buyMessages: buyCount,
            sellMessages: sellCount,
            timestamp: new Date()
        });
        console.log(` Saved average prices to MongoDB: ${result.insertedId}`);
    } catch (error) {
        console.error('Error saving to MongoDB:', error);
    }
}

receiveMessage();
