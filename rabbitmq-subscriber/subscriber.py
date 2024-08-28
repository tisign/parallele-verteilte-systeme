import os
import pika

rabbitmq_host = os.getenv('RABBITMQ_HOST', 'localhost')
rabbitmq_port = int(os.getenv('RABBITMQ_PORT', 5672))
rabbitmq_user = os.getenv('RABBITMQ_USER', 'guest')
rabbitmq_password = os.getenv('RABBITMQ_PASSWORD', 'guest')
queue_name = os.getenv('RABBITMQ_QUEUE', 'default_queue')

credentials = pika.PlainCredentials(rabbitmq_user, rabbitmq_password)
parameters = pika.ConnectionParameters(host=rabbitmq_host, port=rabbitmq_port, credentials=credentials)
connection = pika.BlockingConnection(parameters)
channel = connection.channel()

channel.queue_declare(queue=queue_name)

def callback(ch, method, properties, body):
    print(f"Received: {body.decode()}")

channel.basic_consume(queue=queue_name, on_message_callback=callback, auto_ack=True)

print("Waiting")
channel.start_consuming()