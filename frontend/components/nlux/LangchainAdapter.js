'use client';
import React from 'react'
import { useState, useEffect } from 'react';
import { AiChat, ChatAdapter } from '@nlux/react';
import { useChatAdapter } from '@nlux/langchain-react';
import '@nlux/themes/nova.css'

const generateSessionId = () => {
    return 'session_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const getOrCreateSessionId = () => {
    if (typeof window !== 'undefined') {
        const storedSessionId = localStorage.getItem('chat_session_id');

        if (storedSessionId) {
            return storedSessionId;
        } else {
            const newSessionId = generateSessionId();
            localStorage.setItem('chat_session_id', newSessionId);
            return newSessionId;
        }
    }
    return generateSessionId(); // Fallback for SSR
};

const LangChainAdapter = ({ endpoint, userName }) => {
    const [sessionId, setSessionId] = useState('');

    // Initialize session ID on component mount
    useEffect(() => {
        setSessionId(getOrCreateSessionId());
    }, []);

    // const adapter = useChatAdapter({
    //     url: endpoint,
    //     useInputSchema: false,
    //     config: {
    //         session_id: sessionId
    //     }
    // });

    const adapter = {

        streamText: async (prompt, observer) => {
            const response = await fetch('/api/chat', {
                method: 'POST',
                body: JSON.stringify({ prompt: prompt }),
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.status !== 200) {
                observer.error(new Error('Failed to connect to the server'));
                return;
            }

            if (!response.body) {
                return;
            }

            // Read a stream of server-sent events
            // and feed them to the observer as they are being generated
            const reader = response.body.getReader();
            const textDecoder = new TextDecoder();
            let buffer = '';

            // Process the stream without using while(true)
            try {
                const processStream = async () => {
                    let result = await reader.read();

                    while (!result.done) {
                        buffer += textDecoder.decode(result.value);

                        // Process lines
                        const lines = buffer.split('\n');
                        // Keep the last line which might be incomplete
                        buffer = lines.pop() || '';

                        for (let i = 0; i < lines.length; i++) {
                            const line = lines[i];

                            // When we see "event: data", take the content from the next "data:" line
                            if (line.trim() === 'event: data' && i + 1 < lines.length && lines[i + 1].startsWith('data:')) {
                                const dataLine = lines[i + 1];
                                const content = dataLine.slice(5).trim(); // Remove "data:" prefix

                                // If it's a JSON string with quotes, parse it
                                try {
                                    if (content.startsWith('"') && content.endsWith('"')) {
                                        const parsedContent = JSON.parse(content);
                                        observer.next(parsedContent);
                                    } else {
                                        observer.next(content);
                                    }
                                } catch (e) {
                                    observer.next(content);
                                }

                            }
                        }

                        result = await reader.read();
                    }

                    observer.complete();
                };

                processStream().catch(err => observer.error(err));
            } catch (error) {
                observer.error(error);
            }
        }
    }

    // Load chat history when session ID is available
    useEffect(() => {
        if (sessionId) {
            // TODO: Load chat history
        }
    }, [sessionId, endpoint]);

    return (
        <div>
            <AiChat
                adapter={adapter}
                personaOptions={{
                    assistant: {
                        name: 'Persona',
                        "avatar": <a target="_blank" href='https://github.com/canuysal/persona'><img src='/images/logo.png' /></a>,
                        tagline: `What would you like to know about ${userName}?`,
                    },
                    // user: {
                    //   name: 'Alex',
                    //   avatar: 'https://docs.nlkit.com/nlux/images/personas/alex.png'
                    // }
                }}
                layoutOptions={{
                    height: 320,
                    maxWidth: 600
                }}
            />
            {/* {sessionId && (
                <div className="text-gray-500 mb-2 mt-3 text-end">
                    <button
                        className="bg-buttoncolor-300 hover:bg-buttoncolor-400 text-buttoncolor-800 font-bold py-2 px-4 rounded-l"
                        onClick={() => {
                            const newSessionId = generateSessionId();
                            localStorage.setItem('chat_session_id', newSessionId);
                            setSessionId(newSessionId);
                            // Reload page to start fresh
                            window.location.reload();
                        }}
                    >
                        Reset History
                    </button>
                </div>
            )} */}
        </div>
    );
};

export default LangChainAdapter;