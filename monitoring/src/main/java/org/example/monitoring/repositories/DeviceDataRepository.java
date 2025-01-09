package org.example.monitoring.repositories;

import org.example.monitoring.entities.DeviceData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DeviceDataRepository extends JpaRepository<DeviceData, UUID> {
    List<DeviceData> findAllById(UUID deviceId);

}
