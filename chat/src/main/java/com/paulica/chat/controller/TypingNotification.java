package com.paulica.chat.controller;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TypingNotification {

    private String sender;
    @JsonProperty("isTyping")
    private boolean isTyping;
}
