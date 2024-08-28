import os
import pika
import time
import uuid
from datetime import datetime

rabbitmq_host = os.getenv('RABBITMQ_HOST', 'localhost')
rabbitmq_port = int(os.getenv('RABBITMQ_PORT', 5672))
rabbitmq_user = os.getenv('RABBITMQ_USER', 'guest')
rabbitmq_password = os.getenv('RABBITMQ_PASSWORD', 'guestpassword')
queue_name = os.getenv('RABBITMQ_QUEUE', 'default_queue')

credentials = pika.PlainCredentials(rabbitmq_user, rabbitmq_password)
connection_params = pika.ConnectionParameters(host=rabbitmq_host, port=rabbitmq_port, credentials=credentials)

connection = pika.BlockingConnection(connection_params)
channel = connection.channel()

channel.queue_declare(queue=queue_name, durable=True)

try:
    while True:
        message_id = str(uuid.uuid4())
        current_time = datetime.now()
        message = f"Message ID: {message_id}, Timestamp: {current_time}"

        channel.basic_publish(exchange='', routing_key=queue_name, body=message)
        print(f"Sent message to {queue_name}: {message}")

        time.sleep(15)

except KeyboardInterrupt:
    print("Done")
finally:
    connection.close()