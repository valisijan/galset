"use client";

import { useParams } from 'next/navigation';
import AIChatContainer from '../AIChatContainer';

export default function AIDynamicPage() {
    const params = useParams();
    const id = params?.id as string;

    return <AIChatContainer initialChatId={id} />;
}
