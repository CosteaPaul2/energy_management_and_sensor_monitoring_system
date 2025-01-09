package com.paulica.chat.config;

import com.paulica.chat.controller.ChatMessage;
import com.paulica.chat.controller.MessageType;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messagingTemplate;

    @Getter
    private static final Set<String> connectedUsers = ConcurrentHashMap.newKeySet();

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String username = (String) accessor.getSessionAttributes().get("username");

        if (username != null) {
            log.info("User connected: {}", username);
            connectedUsers.add(username);

            messagingTemplate.convertAndSend("/topic/users", connectedUsers);

            var chatMessage = ChatMessage.builder()
                    .type(MessageType.JOIN)
                    .sender(username)
                    .build();

            messagingTemplate.convertAndSend("/topic/public", chatMessage);
        }
    }

    @EventListener
    public void handleWebSocketListener(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String username = (String) accessor.getSessionAttributes().get("username");

        if (username != null) {
            log.info("User disconnected: {}", username);

            connectedUsers.remove(username);

            messagingTemplate.convertAndSend("/topic/users", connectedUsers);

            var chatMessage = ChatMessage.builder()
                    .type(MessageType.LEAVE)
                    .sender(username)
                    .build();

            messagingTemplate.convertAndSend("/topic/public", chatMessage);
        }
    }

    public static void addUser(String username) {
        connectedUsers.add(username);
    }

}
