import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  TextInput,
  Box,
  Paper,
  Text,
  ScrollArea,
  Avatar,
  Group,
  Transition,
} from "@mantine/core";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { CHATWEBSOCKET, CITY_URL } from "../data/urls";
import Cookies from "js-cookie";
import axios from "axios";
import { ChatMessage } from "../interfaces/ChatMessage";
import { TypingNotification } from "../interfaces/TypingNotification";
import { IconChecks } from "@tabler/icons-react";

const ChatApp: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const stompClient = useRef<Client | null>(null);

  const colors = [
    "#2196F3",
    "#32c787",
    "#00BCD4",
    "#ff5652",
    "#ffc107",
    "#ff85af",
    "#FF9800",
    "#39bbb0",
  ];

  useEffect(() => {
    const fetchUserInfo = async (): Promise<void> => {
      try {
        const token = Cookies.get("jwtToken");
        if (!token) throw new Error("No token found");

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(`${CITY_URL}/auth/info`, config);

        setUsername(response.data.username);
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };
    fetchUserInfo();
  }, []);

  const connect = () => {
    if (username.trim()) {
      const socket = new SockJS(CHATWEBSOCKET);
      stompClient.current = new Client({
        webSocketFactory: () => socket as WebSocket,
        onConnect: onConnected,
        onStompError: onError,
      });

      stompClient.current.activate();
      console.log("Attempting to connect...");
    }
  };

  const onConnected = () => {
    setIsConnected(true);
    console.log("Connected to chat");

    stompClient.current?.subscribe("/topic/public", (payload: IMessage) => {
      const publicMessage: ChatMessage = JSON.parse(payload.body);
      setMessages((prev) => [...prev, publicMessage]);
      if (publicMessage.messageId) {
        sendReadReceipt(publicMessage.messageId);
      }
    });


    stompClient.current?.subscribe("/topic/typing", (payload: IMessage) => {
      const typingNotification: TypingNotification = JSON.parse(payload.body);
      console.log(payload.body);
      setTypingUsers((prev) => {
        // Add or remove users based on typing status
        if (typingNotification.isTyping) {
          if (!prev.includes(typingNotification.sender)) {
            return [...prev, typingNotification.sender];
          }
        } else {
          return prev.filter((user) => user !== typingNotification.sender);
        }
        return prev;
      });
    });

    stompClient.current?.subscribe("/topic/read-receipt", (payload: IMessage) => {
      const readReceipt = JSON.parse(payload.body);
      console.log(`Message read by ${readReceipt.reader} for message ID: ${readReceipt.messageId}`);
      // Handle read receipt (e.g., update message status)
    });

    stompClient.current?.publish({
      destination: "/chat.addUser",
      body: JSON.stringify({ sender: username, type: "JOIN" }),
    });
  };

  const sendMessage = () => {
    if (message.trim() && stompClient.current) {
      const chatMessage: ChatMessage = {
        sender: username,
        content: message,
        type: "CHAT",
        messageId: `${Date.now()}`, // Unique ID for read receipts
      };

      stompClient.current.publish({
        destination: "/chat.sendMessage",
        body: JSON.stringify(chatMessage),
      });

      setMessage(""); // Clear input after sending message
      handleTypingStop(); // Stop typing after sending the message
    }
  };

  const onError = (error: any) => {
    console.error("Could not connect to WebSocket server:", error);
  };

  const handleTyping = () => {
    if (!isTyping && stompClient.current) {
      setIsTyping(true);
      const typingNotification: TypingNotification = {
        sender: username,
        isTyping: true,
      };
      console.log("Typing notification sent:", typingNotification);

      stompClient.current.publish({
        destination: "/chat.typing",
        body: JSON.stringify(typingNotification),
      });
    }
  };

  const handleTypingStop = () => {
    if (isTyping && stompClient.current) {
      setIsTyping(false);
      const typingNotification: TypingNotification = {
        sender: username,
        isTyping: false,
      };
      console.log("Typing notification sent:", typingNotification);
      stompClient.current.publish({
        destination: "/chat.typing",
        body: JSON.stringify(typingNotification),
      });
    }
  };

  const sendReadReceipt = (messageId: string) => {
    if (stompClient.current) {
      const readReceipt = {
        reader: username,
        messageId: messageId,
      };

      stompClient.current.publish({
        destination: "/chat.readMessage",
        body: JSON.stringify(readReceipt),
      });
    }
  };

  const getAvatarColor = (messageSender: string): string => {
    let hash = 0;
    for (let i = 0; i < messageSender.length; i++) {
      hash = 31 * hash + messageSender.charCodeAt(i);
    }
    return colors[Math.abs(hash % colors.length)];
  };

  return (
    <Box style={{ display: "flex", flexDirection: "column", height: "100vh", padding: "1rem" }}>
      {!isConnected ? (
        <Box style={{ margin: "auto" }}>
          <Button onClick={connect}>Join Chat as {username}</Button>
        </Box>
      ) : (
        <>
          <Paper
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              maxHeight: "60vh",
              overflow: "auto",
              marginBottom: "1rem",
            }}
          >
            <ScrollArea style={{ flexGrow: 1 }}>
              {messages.map((message) => {
                const isMine = message.sender === username;
                return (
                  <Group
                    key={message.messageId}
                    style={{
                      justifyContent: isMine ? "flex-end" : "flex-start",
                      margin: "8px 0",
                      width: "100%",
                    }}
                  >
                    {!isMine && (
                      <Avatar color={getAvatarColor(message.sender)}>
                        {message.sender[0]}
                      </Avatar>
                    )}
                    <Text
                      style={{
                        backgroundColor: isMine ? "#D3F8C8" : "#F1F0F0",
                        padding: "8px 12px",
                        borderRadius: "12px",
                        maxWidth: "60%",
                      }}
                    >
                      {message.content}
                    </Text>
                    {isMine && (
                      <Avatar color={getAvatarColor(message.sender)}>
                        {message.sender[0]}
                      </Avatar>
                    )}
                    { !isMine && (
                      <IconChecks size={16} color="green" />
                    )}
                  </Group>
                );
              })}

              <Transition
                mounted={typingUsers.length > 0}
                transition="fade"
                duration={600}
                timingFunction="ease"
              >
                {(styles) => (
                  <Box style={{ ...styles, margin: "8px 0" }}>
                    <Text>{typingUsers.join(", ")} is typing...</Text>
                  </Box>
                )}
              </Transition>
            </ScrollArea>
          </Paper>
          <Box>
            <TextInput
              placeholder="Type a message"
              value={message}
              onChange={(e) => setMessage(e.currentTarget.value)}
              onKeyDown={handleTyping}
            />
            <Button onClick={sendMessage}>Send</Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default ChatApp;