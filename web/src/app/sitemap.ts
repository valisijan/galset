import { MetadataRoute } from "next";
import { db } from "@/db";
import { ads } from "@/db/schema";
import { eq } from "drizzle-orm";
import { slugify } from "@/lib/utils";
import { getCategoriesTreeCached } from "@/lib/categories";

interface Category {
  id: number;
  name: string;
  slug?: string;
  subslug?: string;
  childslug?: string;
  subcategories?: Category[];
}

function getSlug(cat: Category) {
  return cat.slug || cat.subslug || cat.childslug || "";
}

function traverseCategories(categories: Category[], currentPath: string[] = []): string[] {
  let paths: string[] = [];
  for (const cat of categories) {
    const slug = getSlug(cat);
    if (slug) {
      const newPath = [...currentPath, slug];
      paths.push(`/categories/${newPath.join("/")}`);
      if (cat.subcategories) {
        paths.push(...traverseCategories(cat.subcategories, newPath));
      }
    }
  }
  return paths;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://galset.com";

  // 1. Static pages
  const staticPaths = [
    "",
    "/about",
    "/pricing",
    "/policies/terms-of-use",
    "/policies/privacy-policy",
    "/policies/cookie-policy",
    "/policies/community-guidelines",
    "/policies/credits",
  ];

  const staticUrls = staticPaths.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // 2. Categories & Subcategories
  let categoryUrls: MetadataRoute.Sitemap = [];
  try {
    const categories: Category[] = await getCategoriesTreeCached();
    const categoryPaths = traverseCategories(categories);
    categoryUrls = categoryPaths.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Greška pri učitavanju kategorija za sitemap:", error);
  }

  // 3. Dynamic Ads from Database
  let adUrls: MetadataRoute.Sitemap = [];
  try {
    const activeAds = await db.query.ads.findMany({
      where: eq(ads.status, "ACTIVE"),
      columns: {
        id: true,
        title: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: (ads, { desc }) => [desc(ads.createdAt)],
    });

    adUrls = activeAds.map((ad) => {
      const adSlug = slugify(ad.title || "");
      const adPath = `/ads/${adSlug}-${ad.id}`;
      return {
        url: `${baseUrl}${adPath}`,
        lastModified: ad.updatedAt || ad.createdAt || new Date(),
        changeFrequency: "daily" as const,
        priority: 0.6,
      };
    });
  } catch (error) {
    console.error("Greška pri učitavanju oglasa iz baze za sitemap:", error);
  }

  return [...staticUrls, ...categoryUrls, ...adUrls];
}
