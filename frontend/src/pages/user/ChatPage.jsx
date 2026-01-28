import React from 'react';
import { useParams } from 'react-router-dom';
import ChatWindow from '@/components/chat/ChatWindow';

export default function ChatPage() {
    const { id } = useParams();

    if (!id) return <div>Invalid Chat ID</div>;

    return (
        <div className="h-[calc(100vh-100px)]">
            <ChatWindow roomId={id} />
        </div>
    );
}
