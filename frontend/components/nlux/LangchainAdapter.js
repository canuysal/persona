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
            placeholder: `What would you like to learn about ${userName}?`
        }}
    />
}

export default LangChainAdapter