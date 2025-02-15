import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type GamePlayer = {
    id: string;
    connectedAt: Date;
    isHost: boolean;
};

type GameRoom = {
    id: string;
    players: GamePlayer[];
    status: 'waiting' | 'full' | 'playing';
};

type GameMessage = {
    type: string;
    roomId?: string;
    playerId?: string;
    content?: any;
    timestamp?: string;
};

export const useGameWebSocket = (initialRoomId?: string) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const ws = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<GameMessage[]>([]);
    const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;
    const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);

    const generateRoomId = () => Math.random().toString(36).substring(2, 9);

    const handleRoomUpdate = useCallback((roomData: GameRoom) => {
        console.log("🔄 Updating Room:", roomData);
        setCurrentRoom(roomData);
    }, []);

    useEffect(() => {
        if (!currentRoom || !playerId) return;

        const isHost = currentRoom.players.some((p) => p.id === playerId && p.isHost);
        const currentRoomId = searchParams.get("roomId");

        if (isHost && !currentRoomId) {
            console.log("🌍 Updating URL with Room ID:", currentRoom.id);
            const params = new URLSearchParams(searchParams.toString());
            params.set("roomId", currentRoom.id);
            router.replace(`?${params.toString()}`, { scroll: false });
        }
    }, [currentRoom, playerId, router, searchParams]);

    const connect = useCallback(() => {
        if (typeof window === 'undefined' || ws.current?.readyState === WebSocket.OPEN) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//localhost:3001`;

        ws.current = new WebSocket(wsUrl);

        ws.current.onopen = () => {
            console.log('🟢 WebSocket connected');
            setIsConnected(true);
            reconnectAttempts.current = 0;

            const roomId = initialRoomId || searchParams.get('roomId') || generateRoomId();
            let storedPlayerId = localStorage.getItem('playerId');
            let isHost = localStorage.getItem('isHost') === 'true';

            if (!storedPlayerId) {
                storedPlayerId = Math.random().toString(36).substring(2, 9);
                localStorage.setItem('playerId', storedPlayerId);
            }

            if (!searchParams.get('roomId')) {
                isHost = true;
                localStorage.setItem('isHost', 'true');
            }

            console.log('📨 Sending join_room request:', { roomId, storedPlayerId, isHost });

            ws.current?.send(
                JSON.stringify({
                    type: 'join_room',
                    roomId,
                    playerId: storedPlayerId,
                    isHost,
                })
            );

            setPlayerId(storedPlayerId);
        };

        ws.current.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('📩 [WebSocket Message Received]:', data);

                switch (data.type) {
                    case 'room_joined':
                        console.log('✅ Room Joined - Updating UI');
                        setPlayerId(data.playerId);
                        localStorage.setItem('playerId', data.playerId);

                        if (typeof data.isHost !== 'undefined') {
                            localStorage.setItem('isHost', String(data.isHost));
                        }

                        handleRoomUpdate(data.room);
                        break;

                    case 'room_updated':
                        console.log('🔄 Room Updated - Updating Players');
                        handleRoomUpdate(data.room);
                        break;

                    case 'game_message':
                        console.log('💬 New Game Message:', data);
                        setMessages((prev) => [
                            ...prev,
                            { ...data, timestamp: data.timestamp || new Date().toISOString() },
                        ]);
                        break;

                    case 'connected':
                        console.log('✅ WebSocket Connected - Client ID:', data.clientId);
                        break;

                    case 'error':
                        console.error('❌ Game error:', data.message);
                        break;

                    default:
                        console.warn('⚠️ Unknown message type:', data);
                        break;
                }
            } catch (error) {
                console.error('❌ Error parsing game message:', error);
            }
        };

        ws.current.onerror = (error) => {
            console.error('❌ WebSocket error:', error);
        };

        ws.current.onclose = (event) => {
            console.log('🔴 WebSocket closed:', event.code, event.reason);
            setIsConnected(false);
            setCurrentRoom(null);

            if (reconnectAttempts.current < maxReconnectAttempts) {
                reconnectAttempts.current += 1;
                reconnectTimeout.current = setTimeout(connect, 2000);
            }
        };
    }, [initialRoomId, searchParams, handleRoomUpdate]);

    useEffect(() => {
        connect();
        return () => {
            if (ws.current) {
                ws.current.close();
                ws.current = null;
            }
            if (reconnectTimeout.current) {
                clearTimeout(reconnectTimeout.current);
            }
        };
    }, []);

    const sendGameMessage = useCallback((content: any) => {
        if (!ws.current || ws.current.readyState !== WebSocket.OPEN || !currentRoom || !playerId) {
            console.error('❌ Cannot send message: WebSocket not ready or missing room/player info.');
            return;
        }

        try {
            const message = JSON.stringify({
                type: 'game_message',
                roomId: currentRoom.id,
                playerId,
                content,
                timestamp: new Date().toISOString(),
            });

            console.log('📤 Sending message:', message);
            ws.current.send(message);
        } catch (error) {
            console.error('❌ Error sending game message:', error);
        }
    }, [currentRoom, playerId]);

    const leaveRoom = useCallback(() => {
        if (ws.current?.readyState === WebSocket.OPEN && currentRoom) {
            console.log('🚪 Leaving Room:', currentRoom.id);
            ws.current.send(
                JSON.stringify({
                    type: 'leave_room',
                    roomId: currentRoom.id,
                    playerId: playerId,
                })
            );
        }
        setCurrentRoom(null);
        localStorage.removeItem('isHost'); // Remove host status when leaving
        router.replace('/', { scroll: false });
    }, [currentRoom, playerId, router]);

    return {
        isConnected,
        messages,
        currentRoom,
        playerId,
        isHost: localStorage.getItem('isHost') === 'true' && !!playerId, // Ensure player ID exists
        sendGameMessage,
        leaveRoom,
        connectionStatus: ws.current?.readyState ?? -1,
    };
};
