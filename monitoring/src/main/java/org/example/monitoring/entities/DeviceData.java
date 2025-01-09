package org.example.monitoring.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
public class DeviceData {

    @Column(name = "ID")
    private UUID id;

    @Id
    @Column(name = "timestamp", nullable = false)
    private String timestamp;

    @Column(name = "data", nullable = false)
    private String data;
}
