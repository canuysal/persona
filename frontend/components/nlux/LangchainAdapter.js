'use client';
import React from 'react'
import { useState, useEffect } from 'react';
import { AiChat } from '@nlux/react';
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

    const adapter = useChatAdapter({
        url: endpoint,
        useInputSchema: false,
        config: {
            session_id: sessionId
        }
    });

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

export default LangChainAdapter