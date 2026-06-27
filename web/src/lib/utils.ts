export function slugify(text: string): string {
    if (!text) return ""

    const map: { [key: string]: string } = {
        'š': 's', 'đ': 'dj', 'č': 'c', 'ć': 'c', 'ž': 'z',
        'Š': 's', 'Đ': 'dj', 'Č': 'c', 'Ć': 'c', 'Ž': 'z'
    }

    return text
        .toString()
        .toLowerCase()
        .replace(/[šđčćžŠĐČĆŽ]/g, (match) => map[match])
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
}
