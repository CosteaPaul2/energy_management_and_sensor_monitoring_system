package ro.tuc.ds2020.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.tuc.ds2020.controllers.handlers.exceptions.model.ResourceNotFoundException;
import ro.tuc.ds2020.dtos.DeviceDTO;
import ro.tuc.ds2020.dtos.DeviceDetailsDTO;
import ro.tuc.ds2020.dtos.builders.DeviceBuilder;
import ro.tuc.ds2020.entities.Device;
import ro.tuc.ds2020.entities.User;
import ro.tuc.ds2020.repositories.DeviceRepository;
import ro.tuc.ds2020.repositories.UserRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DeviceService {
    private static final Logger LOGGER = LoggerFactory.getLogger(DeviceService.class);

    private final DeviceRepository deviceRepository;
    private final UserRepository userRepository;

    @Autowired
    public DeviceService(DeviceRepository deviceRepository, UserRepository userRepository) {
        this.deviceRepository = deviceRepository;
        this.userRepository = userRepository;
    }

    public List<DeviceDTO> findDevices() {
        LOGGER.debug("Finding all devices");
        List<DeviceDTO> devices = deviceRepository.findAll().stream()
                .map(DeviceBuilder::toDeviceDTO)
                .collect(Collectors.toList());
        LOGGER.debug("Found {} devices", devices.size());
        return devices;
    }

    public DeviceDTO findDeviceById(UUID deviceId) {
        LOGGER.debug("Finding device with ID: {}", deviceId);
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> {
                    LOGGER.error("Device not found with ID: {}", deviceId);
                    return new ResourceNotFoundException("Device not found with ID: " + deviceId);
                });
        LOGGER.debug("Device found: {}", device);
        return DeviceBuilder.toDeviceDTO(device);
    }

    public UUID insert(DeviceDetailsDTO deviceDTO, UUID userId) {
        LOGGER.debug("Inserting device with details: {}", deviceDTO);
        User user = userRepository.findById(userId).orElse(null);
        Device device = DeviceBuilder.toEntity(deviceDTO, user);
        device = deviceRepository.save(device);
        LOGGER.debug("Device with ID {} was inserted in the database", device.getId());
        return device.getId();
    }

    public boolean delete(UUID deviceId) {
        LOGGER.debug("Attempting to delete device with ID: {}", deviceId);
        if (deviceRepository.existsById(deviceId)) {
            deviceRepository.deleteById(deviceId);
            LOGGER.debug("Device with ID {} deleted successfully", deviceId);
            return true;
        }
        LOGGER.warn("Device with ID {} not found for deletion", deviceId);
        return false;
    }

    public List<DeviceDTO> findDevicesByUserId(UUID userId) {
        LOGGER.debug("Finding devices for user ID: {}", userId);
        List<DeviceDTO> devices = deviceRepository.findByUserId(userId).stream()
                .map(DeviceBuilder::toDeviceDTO)
                .collect(Collectors.toList());
        LOGGER.debug("Found {} devices for user ID: {}", devices.size(), userId);
        return devices;
    }

    @Transactional
    public DeviceDTO assignUserToDevice(UUID deviceId, UUID userId, String username) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with ID: " + deviceId));
        LOGGER.debug("Found device: {}", device);

        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            user = new User();
            user.setId(UUID.randomUUID());
            user.setUsername(username);
            LOGGER.debug("User not found, creating new user with username: {}", username);

            try {
                userRepository.save(user);
                LOGGER.debug("User with username '{}' created and saved", user.getUsername());
            } catch (Exception e) {
                LOGGER.error("Error saving user: {}", e.getMessage(), e);
                throw e;
            }
        } else {
            LOGGER.debug("User found: {}", user);
        }
        device.setUser(user);
        try {
            deviceRepository.save(device);
            LOGGER.debug("User assigned to device successfully. Updated device: {}", device);
        } catch (Exception e) {
            LOGGER.error("Error updating device with user: {}", e.getMessage(), e);
            throw e;
        }

        return DeviceBuilder.toDeviceDTO(device);
    }

    public UUID getUserIdByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(User::getId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
    }
    @Transactional
    public DeviceDTO unassignUserFromDevice(UUID deviceId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with ID: " + deviceId));

        device.setUser(null);

        try {
            deviceRepository.save(device);
            LOGGER.debug("User unassigned from device successfully. Updated device: {}", device);
        } catch (Exception e) {
            LOGGER.error("Error unassigning user from device: {}", e.getMessage(), e);
            throw e;
        }

        return DeviceBuilder.toDeviceDTO(device);
    }



}
