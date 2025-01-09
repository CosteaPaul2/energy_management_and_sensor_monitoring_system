package ro.tuc.ds2020.services;


import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import ro.tuc.ds2020.controllers.handlers.exceptions.model.ResourceNotFoundException;
import ro.tuc.ds2020.dtos.PersonDTO;
import ro.tuc.ds2020.dtos.PersonDetailsDTO;
import ro.tuc.ds2020.dtos.builders.PersonBuilder;
import ro.tuc.ds2020.entities.Person;
import ro.tuc.ds2020.repositories.PersonRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PersonService {
    private static final Logger LOGGER = LoggerFactory.getLogger(PersonService.class);
    private final PersonRepository personRepository;
    private final RestTemplate restTemplate;

    public PersonService(PersonRepository personRepository, RestTemplate restTemplate) {
        this.personRepository = personRepository;
        this.restTemplate = restTemplate;
    }

    public List<PersonDTO> findPersons() {
        List<Person> personList = personRepository.findAll();
        return personList.stream()
                .map(PersonBuilder::toPersonDTO)
                .collect(Collectors.toList());
    }

    public PersonDTO findPersonById(UUID id) {
        Optional<Person> prosumerOptional = personRepository.findById(id);
        if (!prosumerOptional.isPresent()) {
            LOGGER.error("Person with id {} was not found in db", id);
            throw new ResourceNotFoundException(Person.class.getSimpleName() + " with id: " + id);
        }
        return PersonBuilder.toPersonDTO(prosumerOptional.get());
    }

    public PersonDTO findPersonByUsername(String username) {
        Optional<Person> prosumerOptional = personRepository.findByUsername(username);
        if(!prosumerOptional.isPresent()) {
            LOGGER.error("Person with username {} was not found in db", username);
            throw new ResourceNotFoundException(Person.class.getSimpleName() + " with username: " + username);
        }

        return PersonBuilder.toPersonDTO(prosumerOptional.get());
    }

    public UUID insert(PersonDetailsDTO personDTO) {
        Person person = PersonBuilder.toEntity(personDTO);
        person = personRepository.save(person);
        LOGGER.debug("Person with id {} was inserted in db", person.getId());
        return person.getId();
    }

    public boolean delete(UUID personId) {
        Optional<Person> person = personRepository.findById(personId);
        if (person.isPresent()) {
            personRepository.delete(person.get());
            return true;
        }
        return false;
    }

    public PersonDetailsDTO update(UUID personId, PersonDetailsDTO personDTO) {
        Optional<Person> personOptional = personRepository.findById(personId);
        if (personOptional.isPresent()) {
            Person personToUpdate = personOptional.get();

            personToUpdate.setName(personDTO.getName());
            personToUpdate.setAge(personDTO.getAge());
            personToUpdate.setAddress(personDTO.getAddress());
            personToUpdate.setPassword(personDTO.getPassword());

            Person updatedPerson = personRepository.save(personToUpdate);

            return new PersonDetailsDTO(updatedPerson.getUsername(), updatedPerson.getName(), updatedPerson.getAddress(), updatedPerson.getAge(), updatedPerson.getPassword());
        } else {
            return null;
        }
    }

    public void assignUserToDevice(UUID deviceId, UUID userId, String username, HttpServletRequest request) {
        String token = getTokenFromRequest(request);
        System.out.println(token);
        String url = "http://reverse-proxy/devices-spring/device/assignUserToDevice?deviceId=" + deviceId + "&userId=" + userId + "&username=" + username;
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + token);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Void> response = restTemplate.exchange(url, HttpMethod.POST, entity, Void.class);

            if (response.getStatusCode() != HttpStatus.OK) {
                throw new RuntimeException("Failed to assign user to device");
            }
        } catch (RestClientException e) {
            throw new RuntimeException("Failed to assign user to device", e);
        }
    }
    private String getTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }


}
