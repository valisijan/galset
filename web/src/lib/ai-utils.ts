export function generateAiChatId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const segments = [];
    for (let i = 0; i < 7; i++) {
        let segment = '';
        for (let j = 0; j < 4; j++) {
            segment += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        segments.push(segment);
    }
    return segments.join('-');
}
