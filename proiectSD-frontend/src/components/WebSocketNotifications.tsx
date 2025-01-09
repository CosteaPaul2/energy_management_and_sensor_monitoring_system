import React, { useEffect, useState, useRef } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ALERTWEBSOCKET } from '../data/urls';
import { IconAlertTriangle } from '@tabler/icons-react';
import { Notification } from '@mantine/core';

const WebSocketNotifications: React.FC = () => {
    const [alerts, setAlerts] = useState<string[]>([]);
    const stompClientRef = useRef<Client | null>(null);

    useEffect(() => {
        const stompClient = new Client({
            webSocketFactory: () => new SockJS(ALERTWEBSOCKET), 
            connectHeaders: {},
            onConnect: (frame) => {
                console.log('Connected: ' + frame);

                stompClient.subscribe('/topic/alerts', (message: IMessage) => {
                    const alertMessage = message.body;
                    if (alertMessage) {
                        setAlerts((prevAlerts) => [...prevAlerts, alertMessage]);
                    }
                });
            },
            onDisconnect: () => {
                console.log('Disconnected from WebSocket server');
            },
            onStompError: (error) => {
                console.error('STOMP Error:', error);
            },
        });

        stompClientRef.current = stompClient;
        stompClient.activate();

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, []);

    const latestAlert = alerts[alerts.length - 1] || 'No alerts yet';
    console.log(latestAlert)
    

    return (
            <Notification
                icon={<IconAlertTriangle size={20} />}
                color="red"
                title="Sensor Consumption Alert"
                mt="md"
            >
                {latestAlert}
            </Notification>
    );
};

export default WebSocketNotifications;
