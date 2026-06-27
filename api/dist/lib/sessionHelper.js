"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUserAgent = parseUserAgent;
exports.resolveIpAndLocation = resolveIpAndLocation;
function parseUserAgent(ua) {
    if (!ua || ua === 'unknown') {
        return { deviceType: 'desktop', name: 'Nepoznat uređaj' };
    }
    const isMobile = /android|iphone|ipad|ipod|mobile/i.test(ua);
    const deviceType = isMobile ? 'mobile' : 'desktop';
    if (!isMobile) {
        if (ua.includes('Windows NT 10.0'))
            return { deviceType, name: 'Windows 11' };
        if (ua.includes('Windows NT 6.3'))
            return { deviceType, name: 'Windows 8.1' };
        if (ua.includes('Windows NT 6.2'))
            return { deviceType, name: 'Windows 8' };
        if (ua.includes('Windows NT 6.1'))
            return { deviceType, name: 'Windows 7' };
        if (ua.includes('Macintosh') || ua.includes('Mac OS X'))
            return { deviceType, name: 'macOS' };
        if (ua.includes('Linux'))
            return { deviceType, name: 'Linux' };
        return { deviceType, name: 'Računar' };
    }
    if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) {
        return { deviceType, name: 'iOS' };
    }
    return { deviceType, name: 'Android' };
}
async function resolveIpAndLocation(clientIp) {
    let ip = clientIp;
    if (ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
    }
    if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
        try {
            const ipRes = await fetch('https://api.ipify.org?format=json');
            if (ipRes.ok) {
                const ipData = (await ipRes.json());
                if (ipData.ip) {
                    ip = ipData.ip;
                }
            }
        }
        catch (e) {
            console.error('Failed to fetch public IP:', e);
        }
    }
    let location = 'Nepoznato';
    try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
        if (geoRes.ok) {
            const geoData = (await geoRes.json());
            if (geoData.status === 'success') {
                const country = translateCountry(geoData.country || '');
                location = geoData.city ? `${country}, ${geoData.city}` : country;
            }
        }
    }
    catch (e) {
        console.error('Failed to geolocate IP:', e);
    }
    return { ip, location };
}
function translateCountry(country) {
    const map = {
        'Serbia': 'Srbija',
        'Croatia': 'Hrvatska',
        'Bosnia and Herzegovina': 'Bosna i Hercegovina',
        'Montenegro': 'Crna Gora',
        'North Macedonia': 'Severna Makedonija',
        'Slovenia': 'Slovenija',
        'Germany': 'Nemačka',
        'Austria': 'Austrija',
        'Switzerland': 'Švajcarska',
    };
    return map[country] || country;
}
