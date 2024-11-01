package ro.tuc.ds2020.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import ro.tuc.ds2020.dtos.validators.annotation.AgeLimit;

import javax.validation.constraints.NotNull;
import java.util.UUID;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PersonDetailsDTO {

    private UUID id;
    @NotNull
    private String username;
    @NotNull
    private String name;
    @NotNull
    private String address;
    @AgeLimit(limit = 18)
    private int age;
    @NotNull
    private String password;

    public PersonDetailsDTO(String username, String name, String address, int age, String password) {
        this.username = username;
        this.name = name;
        this.address = address;
        this.age = age;
        this.password = password;
    }
}