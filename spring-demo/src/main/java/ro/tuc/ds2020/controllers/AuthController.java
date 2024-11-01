package ro.tuc.ds2020.controllers;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import ro.tuc.ds2020.dtos.AuthResponseDTO;
import ro.tuc.ds2020.dtos.LoginDTO;
import ro.tuc.ds2020.dtos.PersonDTO;
import ro.tuc.ds2020.dtos.PersonDetailsDTO;
import ro.tuc.ds2020.entities.Person;
import ro.tuc.ds2020.entities.Role;
import ro.tuc.ds2020.repositories.PersonRepository;
import ro.tuc.ds2020.repositories.RoleRepository;
import ro.tuc.ds2020.security.JWTProvider;
import ro.tuc.ds2020.services.PersonService;

import java.util.Collections;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final PersonRepository personRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTProvider jwtProvider;
    private final PersonService personService;

    @Autowired
    public AuthController(AuthenticationManager authenticationManager, PersonRepository personRepository,
                          RoleRepository roleRepository, PasswordEncoder passwordEncoder, JWTProvider jwtProvider, PersonService personService) {
        this.authenticationManager = authenticationManager;
        this.personRepository = personRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtProvider = jwtProvider;
        this.personService = personService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginDTO loginDTO) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDTO.getUsername(), loginDTO.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtProvider.generateToken(authentication);
        return new ResponseEntity<>(new AuthResponseDTO(token), HttpStatus.OK);
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody PersonDetailsDTO personDetailsDTO) {
        if (personRepository.existsByUsername(personDetailsDTO.getUsername())) {
            return new ResponseEntity<>("Username is taken!", HttpStatus.BAD_REQUEST);
        }

        Role role = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Role 'USER' not found!"));

        System.out.println(role.getName());

        Person person = new Person();
        person.setUsername(personDetailsDTO.getUsername());
        person.setName(personDetailsDTO.getName());
        person.setAge(personDetailsDTO.getAge());
        person.setAddress(personDetailsDTO.getAddress());
        person.setPassword(passwordEncoder.encode(personDetailsDTO.getPassword()));
        person.setRoles(Collections.singletonList(role));

        personRepository.save(person);

        return new ResponseEntity<>("Person created!", HttpStatus.CREATED);
    }
    @GetMapping("/info")
    public ResponseEntity<PersonDTO> getLoggedPersonInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();


        String username = ((UserDetails) authentication.getPrincipal()).getUsername();

        PersonDTO personDTO = personService.findPersonByUsername(username);
        if (personDTO == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } else {
            return new ResponseEntity<>(personDTO, HttpStatus.OK);
        }
    }



}
