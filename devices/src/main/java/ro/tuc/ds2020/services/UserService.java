package ro.tuc.ds2020.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import ro.tuc.ds2020.dtos.UserDTO;
import ro.tuc.ds2020.dtos.builders.UserBuilder;
import ro.tuc.ds2020.entities.User;
import ro.tuc.ds2020.repositories.UserRepository;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Logger LOGGER = LoggerFactory.getLogger(UserService.class);
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;

    @Autowired
    public UserService(UserRepository userRepository, RestTemplate restTemplate) {
        this.userRepository = userRepository;
        this.restTemplate = restTemplate;
    }

    @Transactional
    public User createUser(User user) {
        LOGGER.info("Attempting to create user with username: {}", user.getUsername());
        if (userRepository.findByUsername(user.getUsername()) != null) {
            LOGGER.warn("Username {} already exists. Cannot create user.", user.getUsername());
            throw new IllegalArgumentException("Username already exists");
        }
        User savedUser = userRepository.save(user);
        LOGGER.info("User created successfully with ID: {}", savedUser.getId());
        return savedUser;
    }

    public User findUserById(UUID id) {
        LOGGER.info("Finding user with ID: {}", id);
        return userRepository.findById(id).orElse(null);
    }

    @Transactional
    public void deleteUser(UUID userId) {
        LOGGER.info("Deleting user with ID: {}", userId);
        userRepository.deleteById(userId);
    }

    public List<UserDTO> findUsers() {
        LOGGER.info("Retrieving all users from the database.");
        List<User> personList = userRepository.findAll();
        return personList.stream()
                .map(UserBuilder::toUserDTO)
                .collect(Collectors.toList());
    }
}
