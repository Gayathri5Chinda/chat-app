import React from 'react';

const ChatWindow: React.FC<{ selectedUser: string; messages: string[] }> = ({ selectedUser, messages }) => {
    return (
        <div className="flex-1 p-4 bg-white text-black">
            <h2 className="text-xl font-bold mb-4">Chat with {selectedUser}</h2>
            <div className="h-96 overflow-y-auto border border-gray-300 p-2 rounded">
                {messages.length === 0 ? (
                    <p className="text-gray-500">No messages yet.</p>
                ) : (
                    messages.map((message, index) => (
                        <div key={index} className="mb-2">
                            <p>{message}</p>
                        </div>
                    ))
                )}
            </div>
            <div className="mt-4">
                <input
                    type="text"
                    placeholder="Type a message..."
                    className="border border-gray-300 rounded p-2 w-full"
                />
                <button className="mt-2 bg-black text-white rounded p-2 w-full">Send</button>
            </div>
        </div>
    );
};

export default ChatWindow;