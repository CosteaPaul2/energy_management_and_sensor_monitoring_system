package com.paulica.chat.controller;

import com.paulica.chat.config.WebSocketEventListener;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Set;

@Controller
@Slf4j
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {
        log.info("Public message received: {}", chatMessage);
        messagingTemplate.convertAndSend("/topic/public", chatMessage);
    }

    @MessageMapping("/chat.addUser")
    public void addUser(
            @Payload ChatMessage chatMessage,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        String username = chatMessage.getSender();
        headerAccessor.getSessionAttributes().put("username", username);

        WebSocketEventListener.addUser(username);
        Set<String> connectedUsers = WebSocketEventListener.getConnectedUsers();

        messagingTemplate.convertAndSend("/topic/users", connectedUsers);

        log.info("User connected: {}", username);
    }
    
    @MessageMapping("/chat.typing")
    public void typingNotification(@Payload TypingNotification typingNotification) {
        String sender = typingNotification.getSender();
        boolean isTyping = typingNotification.isTyping();
        log.info("Typing notification received: {}", typingNotification);
        log.info("Sender: {}, isTyping: {}", sender, isTyping);

        messagingTemplate.convertAndSend("/topic/typing", typingNotification);
        log.info("Broadcasted typing notification to /topic/typing: {}", typingNotification);
    }


    // Read receipt
    @MessageMapping("/chat.readMessage")
    public void messageRead(@Payload ReadReceipt readReceipt) {
        log.info("Message read by {} for message ID: {}", readReceipt.getReader(), readReceipt.getMessageId());
        messagingTemplate.convertAndSendToUser(
                readReceipt.getSender(),
                "/read-receipt",
                readReceipt
        );
    }
}
