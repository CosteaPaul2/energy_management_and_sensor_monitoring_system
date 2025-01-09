package ro.tuc.ds2020.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ro.tuc.ds2020.controllers.handlers.exceptions.model.ResourceNotFoundException;
import ro.tuc.ds2020.dtos.DeviceDTO;
import ro.tuc.ds2020.dtos.DeviceDetailsDTO;
import ro.tuc.ds2020.dtos.builders.DeviceBuilder;
import ro.tuc.ds2020.entities.Device;
import ro.tuc.ds2020.repositories.DeviceRepository;
import ro.tuc.ds2020.repositories.UserRepository;
import ro.tuc.ds2020.services.DeviceService;

import javax.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequestMapping(value = "/device")
public class DeviceController {

    private final DeviceService deviceService;
    private final DeviceRepository deviceRepository;
    private final UserRepository userRepository;

    @Autowired
    public DeviceController(DeviceService deviceService, DeviceRepository deviceRepository, UserRepository userRepository) {
        this.deviceService = deviceService;
        this.deviceRepository = deviceRepository;
        this.userRepository = userRepository;
    }

    @GetMapping()
    public ResponseEntity<List<DeviceDTO>> getDevices() {
        List<DeviceDTO> dtos = deviceService.findDevices();
        return new ResponseEntity<>(dtos, HttpStatus.OK);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<DeviceDTO> getDevice(@PathVariable("id") UUID deviceId) {
        DeviceDTO dto = deviceService.findDeviceById(deviceId);
        return new ResponseEntity<>(dto, HttpStatus.OK);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> deleteDevice(@PathVariable("id") UUID deviceId) {
        boolean isDeleted = deviceService.delete(deviceId);
        if (isDeleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DeviceDTO>> getDevicesByUserId(@PathVariable UUID userId) {
        List<DeviceDTO> devices = deviceService.findDevicesByUserId(userId);
        return new ResponseEntity<>(devices, HttpStatus.OK);
    }

   @PostMapping("/createDevice")
   public ResponseEntity<DeviceDetailsDTO> createDevice(@Valid @RequestBody DeviceDetailsDTO deviceDTO) {
        Device device = DeviceBuilder.toEntity(deviceDTO, null);
        device = deviceRepository.save(device);

        return new ResponseEntity<>(deviceDTO, HttpStatus.CREATED);
   }

    @PostMapping("/assignUserToDevice")
    public ResponseEntity<DeviceDTO> assignUserToDevice(
            @RequestParam UUID deviceId,
            @RequestParam UUID userId,
            @RequestParam String username
    ) {
        try {
            DeviceDTO updatedDevice = deviceService.assignUserToDevice(deviceId, userId, username);
            return new ResponseEntity<>(updatedDevice, HttpStatus.OK);
        } catch (ResourceNotFoundException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/user/username/{username}")
    public String getUserDeviceId(@PathVariable String username) {
        UUID uuid = deviceService.getUserIdByUsername(username);
        return uuid == null ? null : uuid.toString();
    }

    @DeleteMapping("/unassign/{deviceId}")
    public ResponseEntity<DeviceDTO> unassignUserFromDevice(@PathVariable UUID deviceId) {
        DeviceDTO updatedDevice = deviceService.unassignUserFromDevice(deviceId);
        return ResponseEntity.ok(updatedDevice);
    }
    @GetMapping("/{deviceId}/max-consumption")
    public ResponseEntity<Double> getMaxConsumption(@PathVariable UUID deviceId) {
        double maxConsumption = deviceService.findDeviceById(deviceId).getHourlyConsumption();
        return new ResponseEntity<>(maxConsumption, HttpStatus.OK);
    }


}
