package com.paulica.chat.controller;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReadReceipt {
    private String sender;
    private String reader;
    private String messageId;
}
