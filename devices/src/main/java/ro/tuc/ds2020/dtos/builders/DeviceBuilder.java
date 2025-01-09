package ro.tuc.ds2020.dtos.builders;

import ro.tuc.ds2020.dtos.DeviceDTO;
import ro.tuc.ds2020.dtos.DeviceDetailsDTO;
import ro.tuc.ds2020.entities.Device;
import ro.tuc.ds2020.entities.User;

import java.util.UUID;

public class DeviceBuilder {

    private DeviceBuilder() {}

    public static DeviceDTO toDeviceDTO(Device device) {
        UUID userId = device.getUser() != null ? device.getUser().getId() : null;
        return new DeviceDTO(device.getId(), device.getName(), userId, device.getDescription(), device.getHourlyConsumption());
    }

    public static Device toEntity(DeviceDetailsDTO deviceDetailsDTO, User user) {
        Device device = new Device(deviceDetailsDTO.getName(), user);
        device.setDescription(deviceDetailsDTO.getDescription());
        device.setHourlyConsumption(deviceDetailsDTO.getHourlyConsumption());
        return device;
    }

}
