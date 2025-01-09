package org.example.monitoring.services;

import com.rabbitmq.client.*;
import org.example.monitoring.entities.DeviceData;
import org.example.monitoring.repositories.DeviceDataRepository;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.TimeoutException;

@Service
public class RabbitMqListener {
    private final DeviceDataRepository deviceDataRepository;
    private static final String QUEUE_NAME = "sensor_data";
    private final WebSocketService webSocketService;

    public RabbitMqListener(DeviceDataRepository deviceDataRepository, WebSocketService webSocketService) {
        this.deviceDataRepository = deviceDataRepository;
        this.webSocketService = webSocketService;

        String rabbitHost = System.getenv("RABBITMQ_HOST");
        int rabbitPort = Integer.parseInt(System.getenv("RABBITMQ_PORT"));

        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost(rabbitHost);
        factory.setPort(rabbitPort);

        try {
            Connection connection = factory.newConnection();
            Channel channel = connection.createChannel();

            channel.queueDeclare(QUEUE_NAME, false, false, false, null);

            DeliverCallback deliverCallback = (consumerTag, delivery) -> {
                String message = new String(delivery.getBody());
                processMessage(message);
            };

            channel.basicConsume(QUEUE_NAME, true, deliverCallback, consumerTag -> {});
        } catch (IOException | TimeoutException e) {
            throw new RuntimeException("Failed to connect to RabbitMQ", e);
        }
    }

    private void processMessage(String message) {
        try {
            JSONObject json = new JSONObject(message);
            String deviceId = json.getString("deviceId");
            String timestamp = json.getString("timestamp");
            String data = json.getString("hourlyConsumption");

            double hourlyConsumption = Double.parseDouble(data);

            DeviceData deviceData = new DeviceData();
            deviceData.setId(UUID.fromString(deviceId));
            deviceData.setTimestamp(timestamp);
            deviceData.setData(data);

            webSocketService.checkAndSendAlert(deviceId, hourlyConsumption);

            deviceDataRepository.save(deviceData);
            System.out.println("Saved data: " + deviceData);
        } catch (Exception e) {
            System.err.println("Failed to process message: " + e.getMessage());
        }
    }
}
