package ro.tuc.ds2020.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DeviceDTO {

    private UUID id;
    private String name;
    private UUID userId;
    private String description;
    private double hourlyConsumption;

}
