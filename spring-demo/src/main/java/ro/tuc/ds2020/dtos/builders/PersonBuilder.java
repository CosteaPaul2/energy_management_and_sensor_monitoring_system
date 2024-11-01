package ro.tuc.ds2020.dtos.builders;

import ro.tuc.ds2020.dtos.PersonDTO;
import ro.tuc.ds2020.dtos.PersonDetailsDTO;
import ro.tuc.ds2020.entities.Person;
import ro.tuc.ds2020.entities.Role;

import java.util.List;
import java.util.stream.Collectors;

public class PersonBuilder {

    private PersonBuilder() {
    }

    public static PersonDTO toPersonDTO(Person person) {
        List<String> roles = person.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        return new PersonDTO(
                person.getId(),
                person.getUsername(),
                person.getName(),
                person.getAge(),
                roles
        );
    }

    public static Person toEntity(PersonDetailsDTO personDetailsDTO) {
        return new Person(
                personDetailsDTO.getUsername(),
                personDetailsDTO.getName(),
                personDetailsDTO.getAddress(),
                personDetailsDTO.getAge(),
                personDetailsDTO.getPassword()
        );
    }
}
