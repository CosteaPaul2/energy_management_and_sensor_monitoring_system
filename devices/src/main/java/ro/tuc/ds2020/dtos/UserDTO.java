package ro.tuc.ds2020.dtos;

import lombok.*;

import java.util.UUID;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class    UserDTO {

    private String username;
    private UUID id;
}
