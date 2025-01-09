package org.example.monitoring.configuration;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {
    @Bean
    public Queue sensorDataQueue() {
        return new Queue("sensor_data");
    }
}
