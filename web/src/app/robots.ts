import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://galset.com";

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/settings/', '/account/', '/inbox/', '/wallet/', '/notifications/', '/ad/*/promotion/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
