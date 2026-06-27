import crypto from 'crypto';

export function parseUserAgent(ua: string): { deviceType: string; name: string } {
  if (!ua || ua === 'unknown') {
    return { deviceType: 'desktop', name: 'Nepoznat uređaj' };
  }

  const isMobile = /android|iphone|ipad|ipod|mobile/i.test(ua);
  const deviceType = isMobile ? 'mobile' : 'desktop';

  if (!isMobile) {
    if (ua.includes('Windows NT 10.0')) return { deviceType, name: 'Windows 11' };
    if (ua.includes('Windows NT 6.3')) return { deviceType, name: 'Windows 8.1' };
    if (ua.includes('Windows NT 6.2')) return { deviceType, name: 'Windows 8' };
    if (ua.includes('Windows NT 6.1')) return { deviceType, name: 'Windows 7' };
    if (ua.includes('Macintosh') || ua.includes('Mac OS X')) return { deviceType, name: 'macOS' };
    if (ua.includes('Linux')) return { deviceType, name: 'Linux' };
    return { deviceType, name: 'Računar' };
  }

  if (ua.includes('iPhone') || ua.includes('iPad') || ua.includes('iPod')) {
    return { deviceType, name: 'iOS' };
  }

  return { deviceType, name: 'Android' };
}

export async function resolveIpAndLocation(clientIp: string): Promise<{ ip: string; location: string }> {
  let ip = clientIp;

  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      if (ipRes.ok) {
        const ipData = (await ipRes.json()) as { ip?: string };
        if (ipData.ip) {
          ip = ipData.ip;
        }
      }
    } catch (e) {
      console.error('Failed to fetch public IP:', e);
    }
  }

  let location = 'Nepoznato';
  try {
    const geoRes = await fetch(`http://ip-api.com/json/${ip}`);
    if (geoRes.ok) {
      const geoData = (await geoRes.json()) as { status: string; country?: string; city?: string };
      if (geoData.status === 'success') {
        const country = translateCountry(geoData.country || '');
        location = geoData.city ? `${country}, ${geoData.city}` : country;
      }
    }
  } catch (e) {
    console.error('Failed to geolocate IP:', e);
  }

  return { ip, location };
}

function translateCountry(country: string): string {
  const map: Record<string, string> = {
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
