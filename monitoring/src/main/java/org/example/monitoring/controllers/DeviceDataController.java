package org.example.monitoring.controllers;

import org.example.monitoring.dtos.DeviceDataDto;
import org.example.monitoring.services.DeviceDataService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RestController
@RequestMapping("/device-data")
public class DeviceDataController {

    @Autowired
    private DeviceDataService deviceDataService;

    @GetMapping("/{deviceId}")
    public ResponseEntity<List<DeviceDataDto>> getDeviceData(@PathVariable UUID deviceId) {
        List<DeviceDataDto> deviceDataDtos = deviceDataService.getDeviceData(deviceId);
        if (deviceDataDtos.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(deviceDataDtos);
    }
}
