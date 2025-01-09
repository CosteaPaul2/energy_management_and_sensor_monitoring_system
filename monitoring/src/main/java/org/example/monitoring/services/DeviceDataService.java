package org.example.monitoring.services;

import org.example.monitoring.builders.DeviceDataBuilder;
import org.example.monitoring.dtos.DeviceDataDto;
import org.example.monitoring.entities.DeviceData;
import org.example.monitoring.repositories.DeviceDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DeviceDataService {

    @Autowired
    private DeviceDataRepository deviceDataRepository;

    public List<DeviceDataDto> getDeviceData(UUID deviceId) {
        List<DeviceData> deviceDataList = deviceDataRepository.findAllById(deviceId);
        return deviceDataList.stream()
                .map(DeviceDataBuilder::toDto)
                .collect(Collectors.toList());
    }
}
