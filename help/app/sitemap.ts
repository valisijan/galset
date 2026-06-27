import fs from 'fs';
import path from 'path';
import type { MetadataRoute } from 'next';

const BASE_URL = 'https://help.galset.com';

function getRoutes(dir: string): string[] {
  const routes: string[] = [];

  function walk(currentDir: string) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (file === 'page.tsx') {
        const relativePath = path.relative(dir, currentDir);
        const route = relativePath ? '/' + relativePath.replace(/\\/g, '/') : '/';
        routes.push(route);
      }
    }
  }

  walk(dir);
  return routes;
}

export default function sitemap(): MetadataRoute.Sitemap {
  try {
    const appDir = path.join(process.cwd(), 'app');
    const routes = getRoutes(appDir);

    return routes.map((route) => {
      // Izračunavanje prioriteta na osnovu dubine rute
      let priority = 0.7;
      if (route === '/') {
        priority = 1.0;
      } else {
        const segments = route.split('/').filter(Boolean);
        if (segments.length === 1) {
          priority = 0.9;
        } else if (segments.length === 2) {
          priority = 0.8;
        }
      }

      return {
        url: `${BASE_URL}${route === '/' ? '' : route}`,
        lastModified: new Date(),
        changeFrequency: route === '/' ? 'daily' : 'weekly',
        priority,
      };
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Fallback u slučaju greške kako se build ne bi srušio
    return [
      {
        url: BASE_URL,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ];
  }
}
