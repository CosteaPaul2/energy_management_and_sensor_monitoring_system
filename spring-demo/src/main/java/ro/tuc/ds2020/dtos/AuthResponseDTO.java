package ro.tuc.ds2020.dtos;

import lombok.Data;

@Data
public class AuthResponseDTO {
    private String access_token;
    private String token_type = "Bearer ";

    public AuthResponseDTO(String access_token) {
        this.access_token = access_token;
    }
}
