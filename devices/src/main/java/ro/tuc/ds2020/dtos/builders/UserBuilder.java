package ro.tuc.ds2020.dtos.builders;

import ro.tuc.ds2020.dtos.DeviceDTO;
import ro.tuc.ds2020.dtos.DeviceDetailsDTO;
import ro.tuc.ds2020.dtos.UserDTO;
import ro.tuc.ds2020.entities.Device;
import ro.tuc.ds2020.entities.User;

import java.util.UUID;

public class UserBuilder {

    private UserBuilder() {}

    public static UserDTO toUserDTO(User user) {
        return new UserDTO(user.getUsername(), user.getId());
    }

    public static User toEntity(UserDTO userDTO) {
        return new User(userDTO.getId(), userDTO.getUsername());
    }
}
