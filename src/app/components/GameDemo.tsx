import React, { useEffect, useState } from 'react';
import { useGameWebSocket } from '../hooks/useGameWebSocket';

type GameMessage = {
    type: string;
    roomId?: string;
    playerId?: string;
    content?: any;
    timestamp?: string;
};

const SimpleGameDemo = () => {
    const [message, setMessage] = useState('');
    const {
        isConnected,
        currentRoom,
        playerId,
        isHost,
        messages,
        sendGameMessage,
        leaveRoom,
    } = useGameWebSocket();

    useEffect(() => {
        console.log("🔄 UI Updated - New Room Data:", currentRoom);
    }, [currentRoom]);

    useEffect(() => {
        console.log("💬 New Messages Updated:", messages);
    }, [messages]);

    const copyRoomLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        alert("Room link copied to clipboard!");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && message.trim()) {
            sendGameMessage(message);
            setMessage('');
        }
    };

    const handleSendMessage = () => {
        if (message.trim()) {
            sendGameMessage(message);
            setMessage('');
        }
    };

    return (
        <div className="max-w-xl mx-auto p-4">
            {/* Connection Status */}
            <div className="mb-4">
                <h1 className="text-xl font-bold mb-2">Game Room</h1>
                <p className="text-sm">
                    Status: {isConnected ? '🟢 Connected' : '🔴 Connecting...'}
                </p>
            </div>

            {/* Room Info */}
            <div className="bg-gray-900 p-4 rounded mb-4 text-white">
                <p>Room ID: {currentRoom?.id || 'Creating...'}</p>
                <p>Players: {currentRoom?.players?.length ?? 0}/2</p>
                <p>Your Role: {isHost ? '👑 Host' : '👤 Guest'}</p>
                <p>Your ID: {playerId || 'Connecting...'}</p>

                {isHost && (
                    <button
                        onClick={copyRoomLink}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Copy Invite Link
                    </button>
                )}
            </div>

            {/* Messages */}
            <div className="border rounded p-4 h-64 overflow-y-auto mb-4">
                {messages.length === 0 ? (
                    <p className="text-gray-500 text-center">No messages yet...</p>
                ) : (
                    messages.map((msg: GameMessage, index: number) => (
                        <div
                            key={index}
                            className={`mb-2 ${msg.playerId === playerId ? 'text-right' : 'text-left'}`}
                        >
                            <div
                                className={`inline-block p-2 rounded max-w-[80%] ${msg.playerId === playerId ? 'bg-blue-100' : 'bg-gray-100'
                                    }`}
                            >
                                <p className="text-xs text-gray-500">
                                    {msg.playerId === playerId ? 'You' : `Player ${msg.playerId}`}
                                </p>
                                <p>{msg.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Message Input */}
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={message}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 p-2 border rounded"
                />
                <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Send
                </button>
            </div>

            {/* Leave Room */}
            <button
                onClick={leaveRoom}
                className="w-full px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
                Leave Room
            </button>
        </div>
    );
};

export default SimpleGameDemo;
