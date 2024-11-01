package ro.tuc.ds2020.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.tuc.ds2020.entities.Person;

import java.util.Optional;
import java.util.UUID;

public interface PersonRepository extends JpaRepository<Person, UUID> {

    Optional<Person> findByUsername(String username);

    Optional<Person> findByName(String name);
    Boolean existsByName(String name);
    Boolean existsByUsername(String username);
}
