"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitSocketEvent = emitSocketEvent;
async function emitSocketEvent(room, event, data) {
    try {
        const webUrl = process.env.NODE_ENV === 'production' ? 'https://galset.com' : 'http://localhost:3000';
        const res = await fetch(`${webUrl}/api/emit-socket`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                event,
                room: room.toString(),
                data,
            }),
        });
        if (res.ok) {
            return await res.json();
        }
        else {
            console.warn(`⚠️ emitSocketEvent [${event}] failed with status ${res.status}`);
        }
    }
    catch (err) {
        console.error(`❌ Greška pri slanju socket događaja [${event}]:`, err);
    }
    return null;
}
