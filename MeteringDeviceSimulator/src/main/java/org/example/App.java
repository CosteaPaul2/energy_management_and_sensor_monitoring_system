package org.example;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;

public class App {
    private static final Path SENSOR_FILE = Paths.get("src", "sensor.csv");
    private static final Path DEVICE_FILE = Paths.get("src", "device.txt");
    private static final String QUEUE_NAME = "sensor_data";
    private static final int INTERVAL_MS = 3000;
    private static final int READINGS_PER_HOUR = 6;
    private static final Logger LOGGER = LoggerFactory.getLogger(App.class.getName());

    public static void main(String[] args) {
        String deviceId = readDeviceId();
        if (deviceId == null || deviceId.isEmpty()) {
            LOGGER.error("Device ID is null or empty. Exiting application.");
            return;
        }

        try (Connection connection = createRabbitMqConnection();
             Channel channel = connection.createChannel()) {

            channel.queueDeclare(QUEUE_NAME, false, false, false, null);
            readAndSendSensorData(deviceId, channel);

        } catch (Exception e) {
            LOGGER.error("Failed to establish connection to RabbitMQ or send data", e);
        }
    }

    private static Connection createRabbitMqConnection() throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost(System.getenv("RABBITMQ_HOST"));
        factory.setUsername("guest");
        factory.setPassword("guest");
        return factory.newConnection();
    }

    private static String readDeviceId() {
        try {
            return new String(Files.readAllBytes(DEVICE_FILE)).trim();
        } catch (IOException e) {
            LOGGER.error("Error reading device ID file", e);
            return null;
        }
    }

    private static void readAndSendSensorData(String deviceId, Channel channel) {
        try (BufferedReader reader = new BufferedReader(new FileReader(SENSOR_FILE.toFile()))) {
            String line;
            Double firstValue = null;
            Double lastValue = null;
            int readingCount = 0;

            while ((line = reader.readLine()) != null) {
                try {
                    double value = Double.parseDouble(line);

                    if (firstValue == null) {
                        firstValue = value;
                    }
                    lastValue = value;
                    readingCount++;

                    if (readingCount == READINGS_PER_HOUR) {
                        Double hourlyConsumption = lastValue - firstValue;
                        sendJsonToQueue(deviceId, hourlyConsumption.toString(), channel);

                        firstValue = null;
                        lastValue = null;
                        readingCount = 0;
                    }

                    // Sleep for the specified interval
                    Thread.sleep(INTERVAL_MS);

                } catch (NumberFormatException e) {
                    LOGGER.error("Error parsing line as a number: {}", line, e);
                }
            }
        } catch (IOException e) {
            LOGGER.error("Error reading sensor data file", e);
        } catch (InterruptedException e) {
            LOGGER.warn("Thread was interrupted while reading and sending sensor data", e);
            Thread.currentThread().interrupt(); // Restore interrupted status
        }
    }

    private static void sendJsonToQueue(String deviceId, String hourlyConsumption, Channel channel) throws IOException {
        String timestamp = getCurrentTimestamp();
        JSONObject json = new JSONObject();
        json.put("deviceId", deviceId);
        json.put("timestamp", timestamp);
        json.put("hourlyConsumption", hourlyConsumption);

        channel.basicPublish("", QUEUE_NAME, null, json.toString().getBytes(StandardCharsets.UTF_8));
        LOGGER.info("Sent message: {}", json.toString());
    }

    private static String getCurrentTimestamp() {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return LocalDateTime.now().format(formatter);
    }
}
