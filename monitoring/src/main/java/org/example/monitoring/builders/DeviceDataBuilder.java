package org.example.monitoring.builders;

import org.example.monitoring.dtos.DeviceDataDto;
import org.example.monitoring.entities.DeviceData;

import java.util.UUID;

public class DeviceDataBuilder {

    private DeviceDataBuilder(){}

    public static DeviceDataDto toDto(DeviceData deviceData){
        UUID uuid = deviceData.getId() != null ? deviceData.getId() : null;
        return new DeviceDataDto(deviceData.getId(), deviceData.getTimestamp(), deviceData.getData());
    }
}
