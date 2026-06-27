"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

export function useFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Parse all current params into an object
    const params = useMemo(() => {
        const p: Record<string, string> = {};
        searchParams?.forEach((value, key) => {
            p[key] = value;
        });
        return p;
    }, [searchParams]);

    const currentPage = parseInt(params["page"] || "1");

    // Helper to update URL with new params
    const updateUrl = useCallback((newParams: Record<string, string | null>) => {
        const nextParams = new URLSearchParams();

        // 1. Handle 'q' (search query)
        const q = newParams.hasOwnProperty('q') ? newParams['q'] : searchParams?.get('q');
        if (q) nextParams.set('q', q);

        // 2. Handle all other filters except sort, page, and category (category is in URL path now)
        const searchParamKeys = searchParams ? Array.from(searchParams.keys()) : [];
        const allKeys = new Set([...searchParamKeys, ...Object.keys(newParams)]);

        allKeys.forEach(key => {
            if (key !== 'q' && key !== 'sort' && key !== 'page' && key !== 'category') {
                let value: string | null = null;

                if (newParams.hasOwnProperty(key)) {
                    value = newParams[key];
                } else {
                    value = searchParams?.get(key) || null;
                }

                if (value !== null && value !== "") {
                    nextParams.set(key, value);
                }
            }
        });

        // 3. Handle 'sort'
        const sort = newParams.hasOwnProperty('sort') ? newParams['sort'] : (searchParams?.get('sort') || 'new');
        if (sort) nextParams.set('sort', sort);

        // 4. Handle 'page'
        const page = newParams.hasOwnProperty('page') ? newParams['page'] : (searchParams?.get('page') || '1');
        if (page) nextParams.set('page', page);

        router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
    }, [router, pathname, searchParams]);

    const setSingle = useCallback((key: string, value: string | null) => {
        const updates: Record<string, string | null> = { [key]: value };
        if (key !== "page") {
            updates["page"] = "1";
        }
        updateUrl(updates);
    }, [updateUrl]);

    const toggleValue = useCallback((key: string, value: string) => {
        const currentVal = params[key] || "";
        const values = currentVal ? currentVal.split(",") : [];

        let nextValues;
        if (values.includes(value)) {
            nextValues = values.filter(v => v !== value);
        } else {
            nextValues = [...values, value];
        }

        const nextValString = nextValues.join(",");
        setSingle(key, nextValString || null);
    }, [params, setSingle]);

    const setPage = useCallback((page: number) => {
        updateUrl({ page: page.toString() });
    }, [updateUrl]);

    const removeTag = useCallback((key: string, value: string) => {
        const currentVal = params[key] || "";
        if (currentVal.includes(",")) {
            const values = currentVal.split(",").filter(v => v !== value);
            setSingle(key, values.join(",") || null);
        } else {
            setSingle(key, null);
        }
    }, [params, setSingle]);

    const activeTags = useMemo(() => {
        const tags: { key: string; label: string; value: string }[] = [];
        searchParams?.forEach((value, key) => {
            if (key !== 'sort' && key !== 'page' && key !== 'q' && key !== 'category') {
                if (value.includes(",")) {
                    value.split(",").forEach(v => {
                        tags.push({ key, label: key, value: v });
                    });
                } else {
                    tags.push({ key, label: key, value });
                }
            }
        });
        return tags;
    }, [searchParams]);

    return {
        params,
        activeTags,
        currentPage,
        setSingle,
        toggleValue,
        setPage,
        removeTag,
    };
}
