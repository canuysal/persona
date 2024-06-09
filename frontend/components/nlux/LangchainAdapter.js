'use client';
import React from 'react'
import { AiChat } from '@nlux/react';
import { useChatAdapter } from '@nlux/langchain-react';
import '@nlux/themes/nova.css'

const LangChainAdapter = ({endpoint, userName}) => {
    const adapter = useChatAdapter({
        url: endpoint,
        useInputSchema: false
    });
    return <AiChat
        adapter={adapter}
        composerOptions={{
            placeholder: `Who is ${userName}?`,
        }}
        personaOptions={{
            assistant: {
                "name": "Persona",
                "tagline": `What would you like to know about ${userName}?`,
                "avatar": <a target="_blank" href='https://github.com/canuysal/persona'><img src='/images/logo.png'/></a>
            }
        }}
    />
}

export default LangChainAdapter