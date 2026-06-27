import AdDetailContainer from "@/components/ads/AdDetailContainer";
import { db } from "@/db";
import { ads } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { Metadata } from "next";

type Props = {
    params: Promise<{ ad: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const adParam = (await params).ad;
    const parts = adParam.split("-");
    const id = parseInt(parts[parts.length - 1]);

    if (isNaN(id)) {
        return {
            title: "Galset - Oglasi",
            description: "Pretražite najbolje oglase za vozila, delove i opremu na Galsetu."
        };
    }

    try {
        const ad = await db.query.ads.findFirst({
            where: eq(ads.id, id),
        });

        if (!ad) {
            return {
                title: "Oglas nije pronađen - Galset",
            };
        }

        const salaryAttr = ad.attributes && typeof ad.attributes === 'object' ? (ad.attributes as any).salary : null;
        const hasSalary = salaryAttr && (salaryAttr.max || salaryAttr.min);
        const isJob = (ad.category && [
            "jobs", "ai-jobs", "admin-support", "security", "cleaning-maintenance",
            "care-sitting", "public-sector", "energy-mining", "finance-accounting",
            "seasonal-manual-labor", "construction", "it-software-design",
            "engineering-architecture", "beauty-wellness", "hr", "marketing-media",
            "medicine-pharmacy", "science-research", "education-culture",
            "agriculture-forestry", "repairs-services", "legal", "sales-retail",
            "production-warehouse", "students-internships", "transport-delivery",
            "hospitality-tourism", "events-entertainment"
        ].includes(ad.category)) || hasSalary;

        let priceDisplay = "";
        if (ad.isReserved) {
            priceDisplay = "Rezervisano";
        } else if (isJob) {
            if (ad.isPriceOnRequest) {
                priceDisplay = "Plata na upit";
            } else {
                const salaryVal = ad.price || (salaryAttr && (salaryAttr.max || salaryAttr.min));
                if (salaryVal) {
                    const formatted = Number(salaryVal).toLocaleString("de-DE");
                    priceDisplay = `${formatted} ${ad.currency || "EUR"} / mes.`;
                } else {
                    priceDisplay = "Plata na upit";
                }
            }
        } else if (ad.isPriceOnRequest) {
            priceDisplay = "Cena na upit";
        } else if (ad.price === 0) {
            priceDisplay = "Poklon";
        } else if (ad.price !== null && ad.price !== undefined) {
            priceDisplay = `${ad.price.toLocaleString("de-DE")} ${ad.currency || "EUR"}`;
        } else {
            priceDisplay = "Po dogovoru";
        }

        const title = `${ad.title} - ${priceDisplay} - Galset`;
        const description = ad.description ? ad.description.substring(0, 160) + "..." : "Pogledajte detalje ovog oglasa na Galsetu - vašem mestu za vozila i opremu.";
        const image = ad.images && ad.images[0] ? ad.images[0] : "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/assets/og-image.png";

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://galset.com";
        const canonicalUrl = `${baseUrl}/ads/${adParam}`;

        return {
            title,
            description,
            alternates: {
                canonical: canonicalUrl,
            },
            openGraph: {
                title,
                description,
                url: canonicalUrl,
                images: [
                    {
                        url: image,
                        width: 1200,
                        height: 630,
                        alt: ad.title,
                    }
                ],
                type: 'article',
                siteName: 'Galset',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [image],
            },
        };
    } catch (error) {
        console.error("Error generating metadata:", error);
        return {
            title: "Galset - Oglasi",
        };
    }
}

export default async function AdPage({ params }: Props) {
    const adParam = (await params).ad;
    const parts = adParam.split("-");
    const id = parseInt(parts[parts.length - 1]);

    let jsonLd = null;

    if (!isNaN(id)) {
        try {
            const ad = await db.query.ads.findFirst({
                where: eq(ads.id, id),
            });

            if (ad) {
                const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://galset.com";
                const canonicalUrl = `${baseUrl}/ads/${adParam}`;
                const images = ad.images && ad.images.length > 0
                    ? ad.images
                    : ["https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/assets/og-image.png"];

                jsonLd = {
                    "@context": "https://schema.org",
                    "@type": "Product",
                    "name": ad.title,
                    "image": images,
                    "description": ad.description || "Pogledajte detalje ovog oglasa na Galsetu - vašem mestu za vozila i opremu.",
                    "offers": {
                        "@type": "Offer",
                        "priceCurrency": ad.currency || "RSD",
                        "availability": ad.isReserved ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
                        "url": canonicalUrl,
                        ...(ad.price !== null && ad.price !== undefined && !ad.isPriceOnRequest ? { "price": ad.price } : {})
                    }
                };
            }
        } catch (error) {
            console.error("Error rendering page JSON-LD:", error);
        }
    }

    return (
        <>
            {jsonLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            )}
            <AdDetailContainer />
        </>
    );
}
