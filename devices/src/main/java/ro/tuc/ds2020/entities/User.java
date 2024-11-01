package ro.tuc.ds2020.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.util.UUID;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {
    private static final long serialVersionUID = 1L;

    @Id
    @Column(name = "user_id")
    private UUID id;

    @Column(name = "user_username", unique = true)
    private String username;

    
}
