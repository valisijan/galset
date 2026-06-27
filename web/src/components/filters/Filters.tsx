"use client";

import { useEffect, useState, useMemo } from "react";
import FilterItem from "./FilterItem";
import { useFilters } from "./useFilters";
import { usePathname } from "next/navigation";
import CategoryNavigator from "./CategoryNavigator";

const cacheMap = new Map<string, any>();

async function fetchWithCache(url: string) {
    if (cacheMap.has(url)) {
        return cacheMap.get(url);
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    cacheMap.set(url, data);
    return data;
}

const isCategoryDescendantOfId = (targetId: number | undefined, parentSlugs: string[], categories: any[]): boolean => {
  if (!targetId || !Array.isArray(categories) || categories.length === 0) return false;
  
  const checkDescendant = (cats: any[], currentPath: string[]): boolean => {
    for (const cat of cats) {
      const slug = cat.slug || cat.subslug || cat.childslug;
      const newPath = [...currentPath, slug];
      if (cat.id === targetId) {
        return newPath.some(s => parentSlugs.includes(s));
      }
      if (cat.subcategories) {
        if (checkDescendant(cat.subcategories, newPath)) return true;
      }
    }
    return false;
  };
  
  return checkDescendant(categories, []);
};

export default function Filters({
    categoryId,
    categories: initialCategories,
    externalParams,
    onChange: externalOnChange,
    onToggle: externalOnToggle,
    initialFiltersData: preloadedFiltersData,
    initialUseFiltersData: preloadedUseFiltersData,
}: {
    categoryId?: number;
    categories?: any[];
    externalParams?: any;
    onChange?: (key: string, value: string | null) => void;
    onToggle?: (key: string, value: string) => void;
    initialFiltersData?: any[];
    initialUseFiltersData?: any;
}) {
    const filterContext = useFilters();
    const pathname = usePathname();

    // Use external props if provided (draft/mobile mode), otherwise fallback to context (desktop direct mode)
    const params = externalParams || filterContext.params;
    const setSingle = externalOnChange || filterContext.setSingle;
    const toggleValue = externalOnToggle || filterContext.toggleValue;

    const [filtersData, setFiltersData] = useState<any[]>(preloadedFiltersData || []);
    const [hasError, setHasError] = useState(false);
    const [useFiltersData, setUseFiltersData] = useState<any>(preloadedUseFiltersData || null);
    const [categories, setCategories] = useState<any[]>(initialCategories || []);
    const [visibleFilters, setVisibleFilters] = useState<any[]>();

    const activeCategoryId = useMemo(() => {
        let pathSegs: string[] = [];

        if (externalOnChange && params["category"]) {
            // Draft mode: params["category"] = full path "vehicles/cars"
            pathSegs = (params["category"] as string).split('/').filter(Boolean);
        } else {
            // Direct mode: read from pathname /search/vehicles/cars
            const segs = (pathname || "").split('/').filter(Boolean);
            if (segs[0] === 'search' && segs.length > 1) {
                pathSegs = segs.slice(1);
            }
        }

        if (pathSegs.length === 0 || categories.length === 0) return categoryId;

        // Walk the tree using path segments
        let currentLevelCats = categories;
        let currentCat: any = null;

        for (let i = 0; i < pathSegs.length; i++) {
            const seg = pathSegs[i];
            const found = currentLevelCats.find(cat => {
                const slug = cat.slug || cat.subslug || cat.childslug;
                return slug === seg;
            });

            if (!found) {
                return categoryId; // fallback
            }
            currentCat = found;
            currentLevelCats = found.subcategories || [];
        }

        return currentCat ? currentCat.id : categoryId;
    }, [categories, pathname, params["category"], categoryId, externalOnChange]);

    useEffect(() => {
        if (initialCategories && initialCategories.length > 0) {
            setCategories(initialCategories);
        }
    }, [initialCategories]);

    useEffect(() => {
        // If preloaded data was passed in as props, skip client-side fetch
        if (preloadedFiltersData && preloadedUseFiltersData) return;

        const promises = [
            fetchWithCache(`${process.env.NEXT_PUBLIC_API_URL}/data/filters-data.json`).catch(() => []),
            fetchWithCache(`${process.env.NEXT_PUBLIC_API_URL}/data/filters/use-filters.json`).catch(() => null),
        ];

        if (!initialCategories || initialCategories.length === 0) {
            promises.push(
                fetchWithCache(`${process.env.NEXT_PUBLIC_API_URL}/data/categories.json`).catch(() => [])
            );
        }

        Promise.all(promises).then(([fd, uf, cat]) => {
            setFiltersData(Array.isArray(fd) ? fd : []);
            setUseFiltersData(uf && !uf.error ? uf : null);
            if (!initialCategories || initialCategories.length === 0) {
                setCategories(Array.isArray(cat) ? cat : []);
            }
        }).catch(err => {
            console.error("Failed to fetch filter data:", err);
            setFiltersData([]);
            setUseFiltersData(null);
            if (!initialCategories || initialCategories.length === 0) {
                setCategories([]);
            }
            setHasError(true);
        });
    }, [initialCategories, preloadedFiltersData, preloadedUseFiltersData]);

    useEffect(() => {
        if (!useFiltersData || filtersData.length === 0) return;

        const globalFilterIds = useFiltersData.global || [];

        const specificFilterIds = activeCategoryId
            ? useFiltersData.specific.find((s: any) => Number(s.categoryId) === Number(activeCategoryId))?.filters || []
            : [];

        const allVisibleFilterIds = [...new Set([...globalFilterIds, ...specificFilterIds])];

        let filtered = allVisibleFilterIds
            .filter(id => id !== 1 && id !== 2)
            .map(id => (filtersData || []).find(f => f.id === id))
            .filter((f): f is NonNullable<typeof f> => f !== undefined && f.slug !== "salary")
            .sort((a, b) => a.id - b.id);

        const isRealEstate = isCategoryDescendantOfId(activeCategoryId, ["real-estate"], categories);
        const isJobs = isCategoryDescendantOfId(activeCategoryId, ["jobs"], categories);
        const isServices = isCategoryDescendantOfId(activeCategoryId, ["services"], categories);
        const isTickets = isCategoryDescendantOfId(activeCategoryId, ["tickets"], categories);
        const isAnimalsPets = isCategoryDescendantOfId(activeCategoryId, ["animals-pets"], categories);

        if (isRealEstate || isAnimalsPets) {
            filtered = filtered.filter(f => f.slug !== "delivery");
        }
        if (isJobs || isServices || isTickets) {
            filtered = filtered.filter(f => f.slug !== "condition");
        }
        if (isJobs || isServices) {
            filtered = filtered.filter(f => f.slug !== "delivery");
        }

        if (isJobs) {
            filtered = filtered.map(f => {
                if (f.slug === "price") {
                    return { ...f, name: "Plata" };
                }
                return f;
            });
        }

        const fetchSources = async () => {
            const updated = await Promise.all(filtered.map(async (f) => {
                if (f.source && f.id !== 3) {
                    try {
                        let path = f.source;
                        if (path.startsWith("/api/data/")) {
                            path = path.replace("/api/data/", "/");
                        } else if (path.startsWith("api/data/")) {
                            path = path.replace("api/data/", "/");
                        }

                        if (path.startsWith("public/")) {
                            path = path.replace("public/", `${process.env.NEXT_PUBLIC_API_URL}/data/`);
                        } else if (!path.startsWith(`${process.env.NEXT_PUBLIC_API_URL}/data/`)) {
                            path = `${process.env.NEXT_PUBLIC_API_URL}/data/${path.startsWith("/") ? path.slice(1) : path}`;
                        }
                        const rawData = await fetchWithCache(path);

                        let options: any[] = [];

                        // Detect brand/model filter by slug pattern: "brand", "car-brand", "moto-brand" etc.
                        const isBrandFilter = f.slug === "brand" || f.slug.endsWith("-brand");
                        const isModelFilter = f.slug === "model" || f.slug.endsWith("-model");
                        // Derive the corresponding brand slug for a model filter: "car-model" → "car-brand"
                        const pairedBrandSlug = isModelFilter
                            ? (f.slug === "model" ? "brand" : f.slug.replace(/-model$/, "-brand"))
                            : null;

                        if (Array.isArray(rawData)) {
                            if (rawData.length > 0 && (rawData[0].brand || rawData[0].name)) {
                                if (isBrandFilter) {
                                    options = rawData.map(item => ({
                                        name: item.brand || item.name,
                                        slug: item.brand || item.name
                                    }));
                                } else if (isModelFilter && pairedBrandSlug) {
                                    const selectedBrands = params[pairedBrandSlug] ? String(params[pairedBrandSlug]).split(",") : [];
                                    if (selectedBrands.length > 0) {
                                        const modelSet = new Set<string>();
                                        selectedBrands.forEach(b => {
                                            const brandData = rawData.find((item: any) => (item.brand || item.name) === b);
                                            if (brandData && brandData.models) {
                                                brandData.models.forEach((m: string) => modelSet.add(m));
                                            }
                                        });
                                        options = Array.from(modelSet).sort().map(m => ({ name: m, slug: m }));
                                    }
                                } else {
                                    options = rawData.map(item => ({
                                        name: item.name || item.brand || item,
                                        slug: item.slug || item.brand || item
                                    }));
                                }
                            } else {
                                options = rawData.map(item => ({ name: item, slug: item }));
                            }
                        } else if (typeof rawData === 'object' && rawData !== null) {
                            if (f.slug === "location" && rawData["Srbija"]) {
                                options = rawData["Srbija"].map((loc: string) => ({ name: loc, slug: loc }));
                            } else if (f.slug === "country") {
                                // Extract country names (keys of the locations object)
                                options = Object.keys(rawData).map(countryName => ({
                                    name: countryName,
                                    slug: countryName
                                }));
                            } else if (f.slug === "city") {
                                // Extract all cities across all countries (flattened values)
                                const allCities = Object.values(rawData).flat() as string[];
                                options = allCities.sort().map(city => ({ name: city, slug: city }));
                            }
                        }

                        return { ...f, options: options.length > 0 ? options : f.options };
                    } catch (e) {
                        console.error("Failed to fetch source for filter", f.id, e);
                        return f;
                    }
                }
                return f;
            }));
            setVisibleFilters(updated);
        };

        fetchSources();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [useFiltersData, filtersData, activeCategoryId, categories, JSON.stringify(params)]);

    if (hasError) return null;

    if (!visibleFilters || visibleFilters.length === 0) {
        return (
            <div className="flex flex-col gap-6 w-full animate-pulse">
                {/* Categories Box Skeleton */}
                <div className="flex flex-col gap-3">
                    <div className="h-4 bg-bg-3 rounded-full w-20" />
                    <div className="border border-bg-3 rounded-3xl bg-bg-2 p-5 flex flex-col gap-5">
                        {Array.from({ length: 6 }).map((_, idx) => (
                            <div key={idx} className="h-4 bg-bg-3 rounded-full w-24" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 w-full">
            {visibleFilters.map((filter) => {
                if (filter.id === 3) {
                    return (
                        <CategoryNavigator
                            key={filter.id}
                            categories={categories}
                            // In draft mode: pass full path from draftParams. In direct mode: undefined (reads from pathname)
                            currentCategorySlug={externalOnChange ? params["category"] : undefined}
                            // In draft mode: update draftParams. In direct mode: undefined (CategoryNavigator navigates itself)
                            onNavigate={externalOnChange ? (slug) => setSingle("category", slug) : undefined}
                        />
                    );
                }

                const isJobs = isCategoryDescendantOfId(activeCategoryId, ["jobs"], categories);
                return (
                    <FilterItem
                        key={filter.id}
                        filter={filter}
                        value={params[filter.slug]}
                        params={params}
                        onChange={setSingle}
                        onToggle={toggleValue}
                        isJobs={isJobs}
                    />
                );
            })}

            {/* Clear Filters Button */}
            <button
                onClick={() => {
                    if (externalOnChange) {
                        // Clear all params except system ones
                        const systemKeys = ['sort', 'page', 'q'];
                        Object.keys(params).forEach(key => {
                            if (!systemKeys.includes(key)) {
                                externalOnChange(key, null);
                            }
                        });
                        externalOnChange("category", null);
                    } else {
                        window.location.href = "/search?sort=new&page=1";
                    }
                }}
                className="mt-4 w-full h-11 border border-bg-3 rounded-full text-gray-400 font-bold hover:text-text-main hover:border-[#6366f1] transition-all text-sm bg-bg-2 hover:bg-bg-3 cursor-pointer"
            >
                Očisti filtere
            </button>
        </div>
    );
}
