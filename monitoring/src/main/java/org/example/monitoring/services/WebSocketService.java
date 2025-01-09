package org.example.monitoring.services;

import org.example.monitoring.controllers.WebSocketController;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class WebSocketService {
    private final WebSocketController webSocketController;

    @Autowired
    public WebSocketService(WebSocketController webSocketController) {
        this.webSocketController = webSocketController;
    }

    public double getMaxHourlyConsumption(String deviceId) {
        String url = "http://reverse-proxy/devices-spring/device/" + deviceId + "/max-consumption";
        try {
            RestTemplate restTemplate = new RestTemplate();
            return restTemplate.getForObject(url, Double.class);
        } catch (Exception e) {
            System.err.println("Failed to fetch max consumption for device " + deviceId);
            return Double.MAX_VALUE;
        }
    }

    public void checkAndSendAlert(String deviceId, double hourlyConsumption) {
        double maxConsumption = getMaxHourlyConsumption(deviceId);

        if (hourlyConsumption > maxConsumption) {
            String message = String.format("Device %s exceeded hourly consumption limit: %.2f kWh", deviceId, hourlyConsumption);
            webSocketController.sendNotification("/topic/alerts", message);
        }
    }
}
