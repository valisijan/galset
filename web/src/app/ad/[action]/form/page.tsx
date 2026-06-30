"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import AdStepProgress from "../AdStepProgress";
import { ChevronRight, X, Bold, Italic, Underline, List, ListOrdered, Undo2, Redo2, ChevronDown, ImagePlus, RotateCw } from "lucide-react";
import FilterOptionsModal from "../FilterOptionsModal";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Loader from "@/components/Loader";

type ImgItem = { id: string; file: File | null; rotation: number; url: string; uploading: boolean; uploadedUrl: string | null; tempImageId: number | null; fileId: string | null };

const getFullCategoryPath = (leafSlug: string, cats: any[]): string => {
  if (typeof window !== "undefined") {
    const storedPath = localStorage.getItem("adFlow_selectedCategoryPath");
    if (storedPath) {
      const parts = storedPath.split('/');
      if (parts[parts.length - 1] === leafSlug) {
        return storedPath;
      }
    }
  }

  const findPath = (items: any[], target: string, currentPath: string[] = []): string[] | null => {
    for (const item of items) {
      const slug = item.slug || item.subslug || item.childslug || item.finalslug;
      const newPath = [...currentPath, slug];
      if (slug === target) return newPath;
      const children = item.subcategories || item.types;
      if (children) {
        const found = findPath(children, target, newPath);
        if (found) return found;
      }
    }
    return null;
  };

  const path = findPath(cats, leafSlug);
  return path ? path.join('/') : leafSlug;
};

export default function MarketplaceForm() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const action = params?.action as string || "add";
  const adId = searchParams?.get('adId');
  const query = action === 'edit' && adId ? `?adId=${adId}` : '';
  const { user, sessionToken, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  const [adOwnerId, setAdOwnerId] = useState<string | null>(null);
  useEffect(() => {
    if (adOwnerId === null) return;
    if (!authLoading && user && String(user.id) !== adOwnerId) {
      router.replace('/');
    }
  }, [user, authLoading, adOwnerId, router]);


  const [categorySlug, setCategorySlug] = useState("");
  const [isSelectorModalOpen, setIsSelectorModalOpen] = useState(false);
  const [activeFilterKey, setActiveFilterKey] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [brands, setBrands] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<Record<string, any>>({});
  const [focusedKey, setFocusedKey] = useState<string | null>(null);
  const [activeInlineDropdown, setActiveInlineDropdown] = useState<string | null>(null);
  const [isStanjeModalOpen, setIsStanjeModalOpen] = useState(false);
  const [isOglasivacModalOpen, setIsOglasivacModalOpen] = useState(false);

  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [powerUnit, setPowerUnit] = useState<"KW" | "KS">("KW");
  const [powerMenu, setPowerMenu] = useState(false);
  const powerMenuRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [draftId, setDraftId] = useState<string | null>(null);
  const isRedirectingRef = useRef(false);


  const [images, setImages] = useState<ImgItem[]>([]);
  const [currency, setCurrency] = useState<"EUR" | "RSD" | "USD">("EUR");
  const [currencyMenu, setCurrencyMenu] = useState(false);
  const [toggle, setToggle] = useState<"cena-na-upit" | "poklanjam" | null>(null);
  const [price, setPrice] = useState("");
  const [title, setTitle] = useState("");
  const [state, setState] = useState<
    "novo" | "kao-novo" | "polovno" | "neispravno" | "osteceno" | null
  >(null);

  const [format, setFormat] = useState<{
    bold: boolean;
    italic: boolean;
    underline: boolean;
    bullets: boolean;
    numbers: boolean;
  }>({ bold: false, italic: false, underline: false, bullets: false, numbers: false });
  const [description, setDescription] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [editorFocused, setEditorFocused] = useState(false);
  const [shipping, setShipping] = useState<{ delivery: boolean; pickup: boolean }>({
    delivery: false,
    pickup: false,
  });
  const [categories, setCategories] = useState<any[]>([]);

  const categorySlugRef = useRef(categorySlug);
  useEffect(() => {
    categorySlugRef.current = categorySlug;
  }, [categorySlug]);

  const hasEnteredChangesRef = useRef(false);
  useEffect(() => {
    if (title.trim() || price.trim() || (description.trim() && description !== "<br>") || images.length > 0) {
      hasEnteredChangesRef.current = true;
    }
  }, [title, price, description, images]);

  // Toast fires only ONCE per flow session when leaving the flow
  useEffect(() => {
    return () => {
      if (action === "add" && categorySlugRef.current) {
        sessionStorage.setItem("adFlow_restoreSlug", categorySlugRef.current);
      }
      if (!isRedirectingRef.current && action === "add" && hasEnteredChangesRef.current) {
        if (!sessionStorage.getItem("adFlow_toasted")) {
          sessionStorage.setItem("adFlow_toasted", "true");
          toast.success("Oglas je sačuvan kao radna verzija");
        }
      }
    };
  }, [action]);

  const [locations, setLocations] = useState<Record<string, string[]>>({});
  const [selectedCountry, setSelectedCountry] = useState("Srbija");
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [showPhone, setShowPhone] = useState(true);
  const [showStreet, setShowStreet] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const currencyMenuRef = useRef<HTMLDivElement>(null);

  const formatPriceDisplay = (raw: string): string => {
    if (!raw) return "";
    const clean = String(raw).replace(/\./g, "").replace(",", ".");
    const [intPart, decPart] = clean.split(".");
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return decPart !== undefined ? `${formattedInt},${decPart}` : formattedInt;
  };

  const getRawPriceForDB = (display: string): string => {
    if (!display) return "";
    return display.replace(/\./g, "").replace(",", ".");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (currencyMenuRef.current && !currencyMenuRef.current.contains(event.target as Node)) {
        setCurrencyMenu(false);
      }
      if (powerMenuRef.current && !powerMenuRef.current.contains(event.target as Node)) {
        setPowerMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);



  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (hasInitializedRef.current) return;

    if (action === "edit" && adId) {
      hasInitializedRef.current = true;
      const storedAdId = localStorage.getItem("adFlow_editAdId");
      const storedDetails = localStorage.getItem("adFlow_details");

      if (storedAdId !== adId || !storedDetails) {
        localStorage.removeItem("adFlow_details");
        localStorage.removeItem("adFlow_selectedSlug");
        localStorage.removeItem("adFlow_editAdOwnerId");

        fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads/${adId}`).then(res => res.json()).then(data => {
          if (data.success && data.ad) {
            const ad = data.ad;
            setAdOwnerId(String(ad.userId));
            setTitle(ad.title || "");
            if (ad.price !== null && ad.price !== undefined) setPrice(formatPriceDisplay(ad.price.toString()));
            else setPrice("");
            if (ad.currency) setCurrency(ad.currency);
            if (ad.attributes?.condition || ad.condition) setState(ad.attributes?.condition || ad.condition);
            if (ad.isPriceOnRequest ?? ad.isContact) setToggle("cena-na-upit");
            else if (ad.price === 0) setToggle("poklanjam");
            else setToggle(null);

            setDescription(ad.description || "");

            if (ad.attributes) setAttributes(ad.attributes);
            else setAttributes({});
            if (ad.phone) setPhone(ad.phone);
            else setPhone("");
            if (ad.showPhone !== undefined) setShowPhone(ad.showPhone);
            if (ad.showAddress !== undefined) setShowStreet(ad.showAddress);
            if (ad.city) { setSelectedCity(ad.city); setCityQuery(ad.city); }
            else { setSelectedCity(""); setCityQuery(""); }
            if (ad.country) setSelectedCountry(ad.country);
            else setSelectedCountry("Srbija");
            if (ad.address || ad.street) setStreet(ad.address || ad.street);
            else setStreet("");
            if (ad.category) {
              setCategorySlug(ad.category);
              localStorage.setItem("adFlow_selectedSlug", ad.category);
            }
            if (ad.images && Array.isArray(ad.images)) {
              const wrapped = ad.images.map((imgUrl: string) => ({
                id: Math.random().toString(36).substr(2, 9),
                file: null,
                rotation: 0,
                url: imgUrl,
                uploading: false,
                uploadedUrl: imgUrl,
                tempImageId: null,
                fileId: null,
              }));
              setImages(wrapped);
            } else {
              setImages([]);
            }

            const validImages = ad.images && Array.isArray(ad.images) ? ad.images : [];
            const details = {
              title: ad.title || "",
              description: ad.description || "",
              price: ad.price !== null && ad.price !== undefined ? ad.price.toString() : "",
              currency: ad.currency || "EUR",
              state: ad.attributes?.condition || ad.condition || null,
              toggle: (ad.isPriceOnRequest ?? ad.isContact) ? "cena-na-upit" : (ad.price === 0 ? "poklanjam" : null),
              country: ad.country || "Srbija",
              city: ad.city || "",
              address: ad.address || ad.street || "",
              street: ad.address || ad.street || "",
              phone: ad.phone || "",
              showPhone: ad.showPhone !== undefined ? ad.showPhone : true,
              showAddress: ad.showAddress !== undefined ? ad.showAddress : true,
              images: validImages,
              imageTempIds: [],
              attributes: ad.attributes || {}
            };

            localStorage.setItem("adFlow_editAdId", adId);
            localStorage.setItem("adFlow_editAdOwnerId", String(ad.userId));
            localStorage.setItem("adFlow_details", JSON.stringify(details));
            window.dispatchEvent(new Event("adFlowUpdate"));
            setIsInitialized(true);
          }
        }).catch(err => {
          console.error("Failed to load ad data for edit", err);
          setIsInitialized(true);
        });
      } else {
        try {
          const details = JSON.parse(storedDetails);
          const storedOwnerId = localStorage.getItem("adFlow_editAdOwnerId");
          if (storedOwnerId) setAdOwnerId(storedOwnerId);
          setTitle(details.title || "");
          if (details.price) setPrice(formatPriceDisplay(details.price.toString()));
          if (details.currency) setCurrency(details.currency);
          if (details.state || details.attributes?.condition) setState(details.state || details.attributes?.condition);
          const storedToggle = details.toggle === "kontakt" ? "cena-na-upit" : (details.toggle || null);
          setToggle(storedToggle);
          setDescription(details.description || "");
          if (details.attributes) setAttributes(details.attributes);
          if (details.phone) setPhone(details.phone);
          if (details.showPhone !== undefined) setShowPhone(details.showPhone);
          if (details.showAddress !== undefined) setShowStreet(details.showAddress);
          if (details.city) { setSelectedCity(details.city); setCityQuery(details.city); }
          if (details.country) setSelectedCountry(details.country);
          if (details.address || details.street) setStreet(details.address || details.street);

          const storedSlug = localStorage.getItem("adFlow_selectedSlug");
          if (storedSlug) setCategorySlug(storedSlug);

          if (details.images && Array.isArray(details.images)) {
            const wrapped = details.images.map((imgUrl: string) => ({
              id: Math.random().toString(36).substr(2, 9),
              file: null,
              rotation: 0,
              url: imgUrl,
              uploading: false,
              uploadedUrl: imgUrl,
              tempImageId: null,
              fileId: null,
            }));
            setImages(wrapped);
          }
        } catch (e) {
          console.error("Failed parsing stored details", e);
        }
        setIsInitialized(true);
      }
    } else if (action === "add" && user && sessionToken) {
      hasInitializedRef.current = true;

      // Try to read category slug from localStorage first to prevent race condition!
      const storedPath = localStorage.getItem("adFlow_selectedCategoryPath");
      if (storedPath) {
        const parts = storedPath.split('/');
        const leafSlug = parts[parts.length - 1];
        if (leafSlug) setCategorySlug(leafSlug);
      }

      const isNewSession = sessionStorage.getItem("adFlow_newSession") === "true";
      const storedDraftId = typeof window !== "undefined" ? (searchParams?.get('draftId') || localStorage.getItem("adFlow_draftId")) : null;

      if (isNewSession && !storedDraftId) {
        sessionStorage.removeItem("adFlow_newSession");
        setIsInitialized(true);
      } else {
        const fetchUrl = storedDraftId 
          ? `${process.env.NEXT_PUBLIC_API_URL}/ads/draft?id=${storedDraftId}`
          : `${process.env.NEXT_PUBLIC_API_URL}/ads/draft`;

        fetch(fetchUrl, {
          headers: {
            "Authorization": `Bearer ${sessionToken}`
          }
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.draft) {
              const draft = data.draft;
              if (draft.id) {
                setDraftId(String(draft.id));
                localStorage.setItem("adFlow_draftId", String(draft.id));
              }
              if (draft.category) setCategorySlug(draft.category);
              if (draft.title) setTitle(draft.title);
              if (draft.price !== null && draft.price !== undefined) setPrice(formatPriceDisplay(draft.price.toString()));
              if (draft.currency) setCurrency(draft.currency);
              if (draft.attributes?.condition || draft.condition) setState(draft.attributes?.condition || draft.condition);
              if (draft.isPriceOnRequest ?? draft.isContact) setToggle("cena-na-upit");
              else if (draft.price === 0) setToggle("poklanjam");
              setDescription(draft.description || "");
              if (draft.attributes) setAttributes(draft.attributes);
              if (draft.phone) setPhone(draft.phone);
              if (draft.city) {
                setSelectedCity(draft.city);
                setCityQuery(draft.city);
              }
              if (draft.country) setSelectedCountry(draft.country);
              if (draft.address || draft.street) setStreet(draft.address || draft.street);
              if (draft.images && Array.isArray(draft.images)) {
                const wrapped = draft.images.map((imgUrl: string) => ({
                  id: Math.random().toString(36).substr(2, 9),
                  file: null,
                  rotation: 0,
                  url: imgUrl,
                  uploading: false,
                  uploadedUrl: imgUrl,
                  tempImageId: null,
                  fileId: null,
                }));
                setImages(wrapped);
              }
            }
            setIsInitialized(true);
          })
          .catch(err => {
            console.error("Failed to load draft data on mount", err);
            setIsInitialized(true);
          });
      }
    }
  }, [action, adId, user, sessionToken]);

  useEffect(() => {
    const fetchFilters = async () => {
      if (!categorySlug) return;
      try {
        const [catRes, ufRes, fdRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/data/categories.json`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/data/filters/use-filters.json`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/data/filters-data.json`)
        ]);

        const rawCategories = await catRes.json();
        setCategories(rawCategories);
        const useFilters = await ufRes.json();
        const filtersData = await fdRes.json();

        // Helper: recursively find a category by slug and return its full path
        const findFullPath = (items: any[], target: string, cur: string[] = []): { id: number; path: string[] } | null => {
          for (const item of items) {
            const slug = item.slug || item.subslug || item.childslug || item.finalslug;
            if (!slug) continue;
            const newPath = [...cur, slug];
            if (slug === target) return { id: item.id, path: newPath };
            const children = item.subcategories || item.types;
            if (children && children.length > 0) {
              const found = findFullPath(children, target, newPath);
              if (found) return found;
            }
          }
          return null;
        };

        // First try: walk the stored full path through the tree
        const resolvedPath = getFullCategoryPath(categorySlug, rawCategories);
        const storedSegs = resolvedPath ? resolvedPath.split('/').filter(Boolean) : [];

        let categoryId: number | null = null;
        let pathSegs: string[] = [];

        if (storedSegs.length > 0 && Array.isArray(rawCategories)) {
          let currentLevelCats = rawCategories;
          let currentCat: any = null;
          for (let i = 0; i < storedSegs.length; i++) {
            const seg = storedSegs[i];
            const found = currentLevelCats.find((c: any) => {
              const slug = c.slug || c.subslug || c.childslug || c.finalslug;
              return slug === seg;
            });
            if (!found) { currentCat = null; break; }
            currentCat = found;
            currentLevelCats = found.subcategories || found.types || [];
          }
          if (currentCat) {
            categoryId = currentCat.id;
            pathSegs = storedSegs;
          }
        }

        // Fallback: recursively search entire tree for the leaf slug
        if (!categoryId) {
          const result = findFullPath(rawCategories, categorySlug);
          if (result) {
            categoryId = result.id;
            pathSegs = result.path;
          }
        }

        if (!categoryId) return;

        const globalIds: number[] = useFilters.global || [];
        const specificSection = useFilters.specific?.find((s: any) => Number(s.categoryId) === Number(categoryId));
        const specificIds: number[] = specificSection ? specificSection.filters : [];
        const allIds = [...new Set([...globalIds, ...specificIds])];

        const categoryFilters: Record<string, any> = {};
        if (Array.isArray(filtersData)) {
          allIds.forEach(id => {
            const filterDef = filtersData.find((f: any) => f.id === id);
            // Exclude: q(1), sort(2), category(3), price(4), country(9), city(10), slug=other
            if (filterDef && filterDef.slug && filterDef.slug !== 'other' &&
                filterDef.id !== 1 && filterDef.id !== 2 && filterDef.id !== 3 &&
                filterDef.id !== 4 && filterDef.id !== 9 && filterDef.id !== 10) {
              const filterClone = { ...filterDef };
              if (filterClone.isFormRadio) filterClone.type = "radio";
              categoryFilters[filterDef.slug] = filterClone;
            }
          });
        }

        const isRealEstate = pathSegs.includes("real-estate");
        const isJobs = pathSegs.includes("jobs");
        const isServices = pathSegs.includes("services");
        const isTickets = pathSegs.includes("tickets");
        const isAnimalsPets = pathSegs.includes("animals-pets");

        if (isRealEstate || isAnimalsPets) delete categoryFilters["delivery"];
        if (isJobs || isServices || isTickets) delete categoryFilters["condition"];
        if (isJobs || isServices) delete categoryFilters["delivery"];

        setFilters(categoryFilters);

        const brandFilterEntry = Object.entries(categoryFilters).find(
          ([slug]) => slug === "brand" || slug.endsWith("-brand")
        );
        const brandFilter = brandFilterEntry?.[1];

        if (brandFilter && brandFilter.source) {
          try {
            let brandSource = brandFilter.source;
            if (brandSource.startsWith("/api/data/")) brandSource = brandSource.replace("/api/data/", "/");
            else if (brandSource.startsWith("api/data/")) brandSource = brandSource.replace("api/data/", "/");
            if (brandSource.startsWith("public/")) {
              brandSource = brandSource.replace("public/", `${process.env.NEXT_PUBLIC_API_URL}/data/`);
            } else {
              brandSource = `${process.env.NEXT_PUBLIC_API_URL}/data/${brandSource.startsWith("/") ? brandSource.slice(1) : brandSource}`;
            }
            const brandRes = await fetch(brandSource);
            const brandData = await brandRes.json();
            setBrands(brandData);
          } catch (err) {
            console.error("Failed fetching brand source", err);
          }
        } else if (brandFilter && brandFilter.options) {
          setBrands(brandFilter.options.map((o: any) => ({ brand: o.name, models: o.models || [] })));
        }

      } catch (e) {
        console.error("Error fetching dynamic filters:", e);
      }
    };
    fetchFilters();
  }, [categorySlug]);

  useEffect(() => {
    if (!isInitialized) return;

    const validImages = images.filter(img => img.uploadedUrl || img.url?.startsWith("http"));
    const imageUrls = validImages.map(img => img.uploadedUrl || img.url);

    const cleanDescription = (description && description.trim() && description !== "<br>" && description !== "<p><br></p>") ? description : null;

    const details = {
      title: title || "",
      description: cleanDescription,
      price: getRawPriceForDB(price) || "",
      currency,
      state,
      toggle,
      country: selectedCountry,
      city: selectedCity || "",
      address: street || "",
      street: street || "",
      phone: phone || "",
      showPhone,
      showAddress: showStreet,
      images: imageUrls,
      imageTempIds: images.map(img => img.tempImageId).filter(Boolean),
      attributes
    };
    localStorage.setItem("adFlow_details", JSON.stringify(details));
    window.dispatchEvent(new Event("adFlowUpdate"));

    const hasChanges = !!(title.trim() || price.trim() || (description.trim() && description !== "<br>") || images.length > 0);

    if (user && sessionToken && action === "add" && hasChanges) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads/draft`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionToken}`
          },
          body: JSON.stringify({
            id: draftId,
            title: title || null,
            description: cleanDescription,
            price: getRawPriceForDB(price) || null,
            currency,
            condition: state,
            category: categorySlug,
            country: selectedCountry,
            city: selectedCity || null,
            address: street || null,
            street: street || null,
            phone: phone || null,
            showPhone,
            showAddress: showStreet,
            images: imageUrls,
            attributes,
            isPriceOnRequest: toggle === "cena-na-upit",
            isContact: toggle === "cena-na-upit"
          })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.draft && data.draft.id) {
              setDraftId(String(data.draft.id));
              localStorage.setItem("adFlow_draftId", String(data.draft.id));
            }
          })
          .catch(err => console.error("Failed to save draft to DB:", err));
      }, 1000);
    }
  }, [title, price, currency, state, toggle, description, shipping, attributes, phone, selectedCountry, selectedCity, street, images, isInitialized, user, sessionToken, categorySlug, action, draftId]);

  useEffect(() => {
    if (isInitialized && editorRef.current) {
      const currentHTML = editorRef.current.innerHTML;
      if (currentHTML !== description && document.activeElement !== editorRef.current) {
        editorRef.current.innerHTML = description || "";
        setCharCount(editorRef.current ? editorRef.current.innerText.length : 0);
      }
    }
  }, [isInitialized, description]);

  useEffect(() => {
    if (user) {
      if (user.phone && !phone) setPhone(user.phone);
      if (user.country && !selectedCountry) setSelectedCountry(user.country);
      if (user.city && !selectedCity && !cityQuery) {
        setSelectedCity(user.city);
        setCityQuery(user.city);
      }
      if (user.address && !street) setStreet(user.address);
    }
  }, [user]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/data/locations.json`)
      .then((r) => r.json())
      .then((data) => setLocations(data || {}))
      .catch(() => setLocations({}));
  }, []);

  useEffect(() => {
    if (!cityQuery) return setCitySuggestions([]);
    const q = cityQuery.toLowerCase();

    if (cityQuery === selectedCity) {
      setCitySuggestions([]);
      return;
    }

    setCitySuggestions(
      (locations[selectedCountry] || []).filter((c) =>
        c.toLowerCase().includes(q)
      )
    );
  }, [cityQuery, selectedCountry, locations, selectedCity]);

  const [isDragging, setIsDragging] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);

  const buildUrl = (raw: string) =>
    /^https?:\/\//i.test(raw) ? raw : 'https://' + raw;

  const makeAnchor = (url: string) => {
    const a = document.createElement('a');
    a.href = buildUrl(url);
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.color = '#6366f1';
    a.style.textDecoration = 'underline';
    a.style.fontWeight = '600';
    a.textContent = url;
    return a;
  };

  const applyEditorLinkify = () => {
    const el = editorRef.current;
    if (!el) return;

    const URL_PATTERN = /(?:https?:\/\/[^\s<>"']+|www\.[^\s<>"']+|\b[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)+(?:\/[^\s<>"']*)?\b)/g;
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(
      el,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          let p: Node | null = node.parentNode;
          while (p && p !== el) {
            if (p.nodeName === 'A') return NodeFilter.FILTER_REJECT;
            p = p.parentNode;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );
    let n: Node | null;
    while ((n = walker.nextNode())) textNodes.push(n as Text);

    let lastInsertedAnchor: HTMLAnchorElement | null = null;

    for (const textNode of textNodes) {
      const text = textNode.textContent || '';
      if (!text.includes('.')) continue;

      URL_PATTERN.lastIndex = 0;
      if (!URL_PATTERN.test(text)) continue;
      URL_PATTERN.lastIndex = 0;

      const frag = document.createDocumentFragment();
      let lastIndex = 0;
      let m: RegExpExecArray | null;
      let hadMatch = false;

      while ((m = URL_PATTERN.exec(text)) !== null) {
        hadMatch = true;
        if (m.index > lastIndex) frag.appendChild(document.createTextNode(text.slice(lastIndex, m.index)));
        const a = makeAnchor(m[0]);
        lastInsertedAnchor = a;
        frag.appendChild(a);
        lastIndex = m.index + m[0].length;
      }

      if (!hadMatch) continue;
      if (lastIndex < text.length) frag.appendChild(document.createTextNode(text.slice(lastIndex)));

      textNode.parentNode?.replaceChild(frag, textNode);
    }

    if (lastInsertedAnchor) {
      const sel = window.getSelection();
      if (sel) {
        try {
          const range = document.createRange();
          const nodeAfter = lastInsertedAnchor.nextSibling;
          if (nodeAfter) {
            range.setStart(nodeAfter, 0);
            range.collapse(true);
          } else if (lastInsertedAnchor.parentNode) {
            range.setStartAfter(lastInsertedAnchor);
            range.collapse(true);
          }
          sel.removeAllRanges();
          sel.addRange(range);
        } catch (_) { }
      }
    }

    setDescription(el.innerHTML);
  };

  const fileToJpegBlob = (file: File, rotation = 0): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new (window as any).Image();
        img.onload = () => {
          let origW = img.width;
          let origH = img.height;

          const MAX_SIZE = 1600;
          if (origW > MAX_SIZE || origH > MAX_SIZE) {
            if (origW > origH) {
              origH = Math.round((origH * MAX_SIZE) / origW);
              origW = MAX_SIZE;
            } else {
              origW = Math.round((origW * MAX_SIZE) / origH);
              origH = MAX_SIZE;
            }
          }

          const is90or270 = rotation === 90 || rotation === 270;
          const w = is90or270 ? origH : origW;
          const h = is90or270 ? origW : origH;
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject("No canvas context");
          ctx.save();
          ctx.translate(w / 2, h / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          const dw = is90or270 ? h : w;
          const dh = is90or270 ? w : h;
          ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
          ctx.restore();
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject("Failed to create blob");
          }, "image/jpeg", 0.7);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
    });
  };

  const uploadSingleImage = async (imgId: string, file: File, rotation: number) => {
    try {
      let uploadFile: File;
      try {
        const blob = await fileToJpegBlob(file, rotation);
        uploadFile = new File([blob], `image-${imgId}.jpg`, { type: "image/jpeg" });
      } catch {
        uploadFile = file;
      }

      const headers: Record<string, string> = {};
      if (sessionToken) {
        headers["Authorization"] = `Bearer ${sessionToken}`;
      }

      const tempFormData = new FormData();
      tempFormData.append("file", uploadFile);
      tempFormData.append("imageType", "ad");

      const tempRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload-temp-image`, {
        method: "POST",
        headers,
        body: tempFormData,
      });

      if (!tempRes.ok) throw new Error("Upload failed on backend");
      const tempData = await tempRes.json();

      setImages(prev => prev.map(img =>
        img.id === imgId
          ? {
            ...img,
            uploading: false,
            uploadedUrl: tempData.url,
            fileId: tempData.fileId,
            tempImageId: tempData.tempImageId
          }
          : img
      ));
    } catch (e) {
      console.error("Upload failed for", imgId, e);
      setImages(prev => prev.map(img =>
        img.id === imgId ? { ...img, uploading: false } : img
      ));
      toast.error("Greška pri otpremanju slike.");
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    if (images.length + files.length > 50) {
      toast.info("Maksimalan broj slika je 50");
    }
    const arr = Array.from(files).slice(0, 50 - images.length);
    const newItems = arr.map((f) => ({
      id: Math.random().toString(36).substr(2, 9),
      file: f,
      rotation: 0,
      url: URL.createObjectURL(f),
      uploading: true,
      uploadedUrl: null,
      tempImageId: null,
      fileId: null,
    }));
    setImages((s) => [...s, ...newItems]);
    newItems.forEach((item) => uploadSingleImage(item.id, item.file!, 0));
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    e.target.value = "";
  };

  const removeImage = (i: number) => {
    setImages((s) => {
      const item = s[i];
      if (item.url && item.url.startsWith("blob:")) {
        try { URL.revokeObjectURL(item.url); } catch { }
      }
      return s.filter((_, idx) => idx !== i);
    });
  };

  const rotateImageOnCanvas = (url: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new (window as any).Image();
      img.onload = () => {
        let origW = img.width;
        let origH = img.height;

        const MAX_SIZE = 1600;
        if (origW > MAX_SIZE || origH > MAX_SIZE) {
          if (origW > origH) {
            origH = Math.round((origH * MAX_SIZE) / origW);
            origW = MAX_SIZE;
          } else {
            origW = Math.round((origW * MAX_SIZE) / origH);
            origH = MAX_SIZE;
          }
        }

        const w = origH;
        const h = origW;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("No canvas context");
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate((90 * Math.PI) / 180);
        ctx.drawImage(img, -h / 2, -w / 2, h, w);
        ctx.restore();
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject("Failed to create blob");
        }, "image/jpeg", 0.85);
      };
      img.onerror = reject;

      if (!url.startsWith("blob:")) {
        img.crossOrigin = "anonymous";
        const buster = `r=${Math.random().toString(36).substring(2, 7)}`;
        img.src = url.includes("?") ? `${url}&${buster}` : `${url}?${buster}`;
      } else {
        img.src = url;
      }
    });
  };

  const rotateImage = async (i: number) => {
    const itemToRotate = images[i];
    if (!itemToRotate) return;
    
    setImages((s) => s.map((it, idx) => idx === i ? { ...it, uploading: true } : it));

    try {
      const imageUrl = itemToRotate.url || itemToRotate.uploadedUrl;
      if (!imageUrl) {
        throw new Error("No image URL found");
      }
      const blob = await rotateImageOnCanvas(imageUrl);
      
      const rotatedFile = new File([blob], `image-${itemToRotate.id}.jpg`, { type: "image/jpeg" });
      const localUrl = URL.createObjectURL(rotatedFile);
      
      setImages(prev => prev.map(img =>
        img.id === itemToRotate.id
          ? { 
              ...img, 
              file: rotatedFile, 
              url: localUrl, 
              rotation: 0 
            }
          : img
      ));

      await uploadSingleImage(itemToRotate.id, rotatedFile, 0);
    } catch (e) {
      console.error("Failed to rotate image", e);
      setImages(prev => prev.map(img =>
        img.id === itemToRotate.id ? { ...img, uploading: false } : img
      ));
      toast.error("Greška pri rotiranju slike.");
    }
  };

  const handleToggle = (t: "cena-na-upit" | "poklanjam") => {
    if (toggle === t) {
      setToggle(null);
      setPrice("");
    } else {
      setToggle(t);
      setPrice("");
    }
  };

  const onPriceFocus = () => {
    if (toggle) {
      setToggle(null);
      setPrice("");
    }
  };

  const onPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    if (!raw) {
      setPrice("");
      if (errors.price) setErrors(prev => ({ ...prev, price: "" }));
      return;
    }

    const noThousands = raw.replace(/\./g, "");
    const parts = noThousands.split(",");
    const intPart = parts[0];
    const decPart = parts[1];

    if (!/^\d*$/.test(intPart)) return;
    if (intPart.length > 15) return;

    if (decPart !== undefined) {
      if (!/^\d{0,2}$/.test(decPart)) return;
    }

    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    const formatted = decPart !== undefined ? `${formattedInt},${decPart}` : formattedInt;

    setPrice(formatted);
    if (errors.price) setErrors(prev => ({ ...prev, price: "" }));
  };

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (errors.title) setErrors(prev => ({ ...prev, title: "" }));
  };

  const selectState = (
    k: "novo" | "kao-novo" | "polovno" | "neispravno" | "osteceno"
  ) => {
    setState(k);
    if (errors.state) setErrors(prev => ({ ...prev, state: "" }));
  };



  const isCategoryDescendantOf = (parentSlugs: string[]) => {
    if (!categorySlug || categories.length === 0) return false;
    const fullPath = getFullCategoryPath(categorySlug, categories);
    const pathSegs = fullPath.split('/').filter(Boolean);
    return pathSegs.some(s => parentSlugs.includes(s));
  };

  const handleNext = async () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Molimo unesite naslov oglasa";

    const isServicesForm = isCategoryDescendantOf(["services"]);
    const isJobsForm = isCategoryDescendantOf(["jobs"]);
    const isTicketsForm = isCategoryDescendantOf(["tickets"]);

    if (!isServicesForm && !toggle && !price.trim()) {
      newErrors.price = isJobsForm ? "Molimo unesite platu" : "Molimo unesite cenu";
    }

    if (!isJobsForm && !isServicesForm && !isTicketsForm && !state) newErrors.state = "Molimo unesite stanje";

    const brandAttrKey = Object.keys(filters).find(k => k === "brand" || k.endsWith("-brand"));
    Object.keys(filters).forEach(key => {
      const isModelSlug = key === "model" || key.endsWith("-model");
      if (isModelSlug && (!brandAttrKey || !attributes[brandAttrKey])) return;

      const isSystemOptional = ["country", "city", "street", "phone"].includes(key);
      const isCustomOptional =
        key === "condition" || // validated separately via `state`
        key === "seller" ||    // optional - tip oglašivača
        key === "safety" || key.endsWith("-safety") ||
        key === "equipment" || key.endsWith("-equipment") ||
        key === "extra-info" || key.endsWith("-extra-info") ||
        key === "benefits" || key.endsWith("-benefits") ||
        key === "language" || key.endsWith("-language") ||
        key === "driver-license" || key.endsWith("-driver-license") ||
        key === "salary" || key === "salary-type";

      if (isSystemOptional || isCustomOptional) return;

      const filter = filters[key];
      const val = attributes[key];
      let isEmpty = !val;

      if (Array.isArray(val)) {
        isEmpty = val.length === 0;
      } else if (typeof val === 'object' && val !== null) {
        isEmpty = !val.min && !val.max && !val.amount;
      }

      if (isEmpty) {
        newErrors[key] = `Molimo unesite ${filter.name?.toLowerCase() || filter.label?.toLowerCase() || "vrednost"}`;
      }
    });

    if (!selectedCountry) newErrors.country = "Molimo izaberite državu";
    if (!selectedCity) newErrors.city = "Molimo izaberite grad iz liste";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (images.some(img => img.uploading)) {
      toast.info("Sačekajte da se sve slike završe sa otpremanjem...");
      return;
    }

    const latestDescription = editorRef.current ? editorRef.current.innerHTML : description;
    const cleanDescription = (latestDescription && latestDescription.trim() && latestDescription !== "<br>" && latestDescription !== "<p><br></p>") ? latestDescription : null;
    const validImagesForSave = images.filter(img => img.uploadedUrl || img.url?.startsWith("http"));
    const imageUrlsForSave = validImagesForSave.map(img => img.uploadedUrl || img.url);
    const rawPrice = getRawPriceForDB(price);
    const detailsToSave = {
      title: title || "",
      description: cleanDescription,
      price: rawPrice || "",
      currency,
      state,
      toggle,
      country: selectedCountry,
      city: selectedCity || "",
      address: street || "",
      street: street || "",
      phone: phone || "",
      showPhone,
      showAddress: showStreet,
      images: imageUrlsForSave,
      imageTempIds: images.map(img => img.tempImageId).filter(Boolean),
      attributes
    };
    localStorage.setItem("adFlow_details", JSON.stringify(detailsToSave));
    if (categorySlug) localStorage.setItem("adFlow_selectedSlug", categorySlug);
    window.dispatchEvent(new Event("adFlowUpdate"));

    if (action === "add" && user && sessionToken) {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ads/draft`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${sessionToken}`
          },
          body: JSON.stringify({
            id: draftId,
            title: title || null,
            description: cleanDescription,
            price: rawPrice || null,
            currency,
            condition: state,
            category: categorySlug,
            country: selectedCountry,
            city: selectedCity || null,
            address: street || null,
            street: street || null,
            phone: phone || null,
            showPhone,
            showAddress: showStreet,
            images: imageUrlsForSave,
            attributes,
            isPriceOnRequest: toggle === "cena-na-upit",
            isContact: toggle === "cena-na-upit"
          })
        });
        const data = await res.json();
        if (data.success && data.draft && data.draft.id) {
          setDraftId(String(data.draft.id));
          localStorage.setItem("adFlow_draftId", String(data.draft.id));
        }
      } catch (err) {
        console.error("Failed to save draft before navigation:", err);
      }
    }

    try {
      isRedirectingRef.current = true;
      router.push(`/ad/${action}/promotion${query}`);
    } catch (error) {
      console.error("Error in handleNext:", error);
      toast.error("Greška pri čuvanju podataka.");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const execCommand = (cmd: string) => {
    document.execCommand(cmd);
    if (editorRef.current) editorRef.current.focus();
  };

  const toggleFormat = (type: "bold" | "italic" | "underline" | "bullets" | "numbers") => {
    if (type === "bold" || type === "italic" || type === "underline") {
      const others = ["bold", "italic", "underline"].filter((t) => t !== type);
      others.forEach((other) => {
        if (document.queryCommandState(other)) {
          document.execCommand(other, false);
        }
      });
      document.execCommand(type, false);
      updateFormatState();
      if (editorRef.current) editorRef.current.focus();
    } else if (type === "bullets" || type === "numbers") {
      const el = editorRef.current;
      if (!el) return;

      el.focus();

      requestAnimationFrame(() => {
        const unorderedActive = document.queryCommandState("insertUnorderedList");
        const orderedActive = document.queryCommandState("insertOrderedList");

        if (type === "bullets") {
          if (unorderedActive) {
            // Toggle off bullets
            document.execCommand("insertUnorderedList", false);
          } else if (orderedActive) {
            // Convert ordered → unordered on the current line
            document.execCommand("insertOrderedList", false);
            document.execCommand("insertUnorderedList", false);
          } else {
            // No active list — insert new bullet list at cursor position
            document.execCommand("insertUnorderedList", false);
          }
        } else {
          if (orderedActive) {
            // Toggle off numbers
            document.execCommand("insertOrderedList", false);
          } else if (unorderedActive) {
            // Convert unordered → ordered on the current line
            document.execCommand("insertUnorderedList", false);
            document.execCommand("insertOrderedList", false);
          } else {
            // No active list — insert new numbered list at cursor position
            document.execCommand("insertOrderedList", false);
          }
        }

        if (el) setDescription(el.innerHTML);
        updateFormatState();
      });
    }
  };

  const updateFormatState = () => {
    setFormat({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      underline: document.queryCommandState("underline"),
      bullets: document.queryCommandState("insertUnorderedList"),
      numbers: document.queryCommandState("insertOrderedList"),
    });
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      if (document.activeElement === editorRef.current) {
        updateFormatState();
      }
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  const undo = () => execCommand("undo");
  const redo = () => execCommand("redo");

  return (
    <main className="min-h-screen bg-bg-1 flex flex-col items-center py-6 md:py-10 px-4">
      <div className="w-full max-w-[800px] flex flex-col">
        <AdStepProgress currentStep={2} />
        <div className="p-0 md:p-0 mt-6">
          {authLoading || !isInitialized ? (
            <div className="w-full max-w-[800px] space-y-6 animate-pulse select-none">
              {/* Images Skeleton */}
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 md:h-32 bg-bg-2 border border-bg-4 rounded-3xl w-full" />
                ))}
              </div>

              {/* Title Input Skeleton */}
              <div className="h-[60px] bg-bg-2 border border-bg-4 rounded-full w-full" />

              {/* Price Input Skeleton */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="h-[60px] bg-bg-2 border border-bg-4 rounded-full flex-1" />
                <div className="flex gap-4">
                  <div className="w-24 h-6 bg-bg-2 rounded-full" />
                  <div className="w-24 h-6 bg-bg-2 rounded-full" />
                </div>
              </div>

              {/* Filter Inputs Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-[60px] bg-bg-2 border border-bg-4 rounded-full w-full" />
                ))}
              </div>

              {/* Description Skeleton */}
              <div className="space-y-2">
                <div className="h-5 w-16 bg-bg-2 rounded-full" />
                <div className="border border-bg-4 rounded-3xl overflow-hidden">
                  <div className="h-[50px] bg-bg-2 border-b border-bg-4" />
                  <div className="h-[150px] bg-bg-1" />
                </div>
              </div>

              {/* Contact Header */}
              <div className="h-6 w-48 bg-bg-2 rounded-full pt-6" />

              {/* Contact Fields Skeleton */}
              <div className="space-y-6">
                <div className="h-[60px] bg-bg-2 border border-bg-4 rounded-full w-full" />
                <div className="h-[60px] bg-bg-2 border border-bg-4 rounded-full w-full" />
                <div className="h-[60px] bg-bg-2 border border-bg-4 rounded-full w-full" />
                <div className="h-[60px] bg-bg-2 border border-bg-4 rounded-full w-full" />
              </div>

              {/* Buttons Skeleton */}
              <div className="flex flex-col-reverse md:flex-row justify-between gap-3 pt-4">
                <div className="h-[56px] bg-bg-2 rounded-full w-full md:w-[180px]" />
                <div className="h-[56px] bg-bg-2 rounded-full w-full md:w-[180px]" />
              </div>
            </div>
          ) : (
            <form className="space-y-6">

              {/* ✅ SLIKE */}
              <div
                className="grid grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 relative select-none"
                id="image-grid"
              >
                {images.map((img, idx) => (
                  <DraggableImage
                    key={img.id}
                    img={img}
                    idx={idx}
                    count={images.length}
                    rotateImage={rotateImage}
                    removeImage={removeImage}
                    onReorder={(fromIdx, toIdx) => {
                      if (fromIdx === toIdx) return;
                      setImages(prev => {
                        const next = [...prev];
                        const [removed] = next.splice(fromIdx, 1);
                        next.splice(toIdx, 0, removed);
                        return next;
                      });
                    }}
                  />
                ))}

                {images.length < 50 && (
                  <div className={`${images.length === 0 ? "col-span-3 md:col-span-5" : ""}`}>
                    <label
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`flex flex-col items-center justify-center border border-dashed rounded-3xl cursor-pointer
                        ${images.length === 0 ? "h-32" : "h-24 md:h-32"} hover:border-[#6366f1] transition ${isDragging ? "border-[#6366f1]" : "border-bg-4"
                        }`}
                    >
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={onFileChange}
                      />
                      <ImagePlus className="w-8 h-8 text-[#6366f1] select-none" />
                      {images.length === 0 ? (
                        <span className="text-gray-400 text-xs md:text-sm mt-2 text-center px-4">
                          Prevucite slike ovde ili kliknite da biste pregledali datoteke
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[10px] md:text-xs mt-1 text-center px-1">
                          Dodaj još
                        </span>
                      )}
                    </label>
                  </div>
                )}
              </div>

              {/* ✅ NASLOV */}
              <div className="relative mb-6">
                <input
                  type="text"
                  name="title"
                  value={title}
                  onChange={onTitleChange}
                  maxLength={50}
                  className={`w-full border rounded-full bg-transparent px-4 py-4 text-text-main focus:border-[#6366f1] outline-none peer transition-colors duration-200
                    ${errors.title ? "border-red-500 focus:border-red-500" : "border-bg-4"}`}
                />
                <label
                  className={`absolute left-4 pointer-events-none bg-bg-1 px-1 transition-all
                    peer-focus:-translate-y-2 peer-focus:text-sm
                    ${title.length > 0 || errors.title
                      ? "-translate-y-2 text-sm"
                      : "translate-y-4 text-gray-500 dark:text-gray-400"
                    }
                    ${errors.title ? "text-red-500 peer-focus:text-red-500" : "peer-focus:text-[#6366f1]"}`}
                >
                  Naslov oglasa
                </label>
                {errors.title && (
                  <div className="flex items-center gap-2 mt-2 ml-4">
                    <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-text-main text-xs font-bold">!</div>
                    <span className="text-sm text-red-400">{errors.title}</span>
                  </div>
                )}
              </div>

              {/* ✅ CENA / PLATA + VALUTA + TOGGLE SWITCH */}
              {!isCategoryDescendantOf(["services"]) && (
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex items-center gap-4 flex-wrap">

                    {/* Cena / Plata Input with Currency */}
                    <div className="relative flex-1">
                      <input
                        type="text"
                        name="price"
                        value={toggle === "poklanjam" ? "Poklanjam" : toggle === "cena-na-upit" ? (isCategoryDescendantOf(["jobs"]) ? "Plata na upit" : "Cena na upit") : price}
                        onChange={onPriceChange}
                        onFocus={onPriceFocus}
                        onBlur={() => {
                          if (price === "0" && !isCategoryDescendantOf(["jobs"])) {
                            handleToggle("poklanjam");
                          }
                        }}
                        inputMode="decimal"
                        className={`w-full border rounded-full bg-transparent px-4 py-4 pr-32 text-text-main focus:border-[#6366f1] outline-none peer transition-colors duration-200
                          ${errors.price ? "border-red-500 focus:border-red-500" : "border-bg-4"}`}
                      />
                      <label
                        className={`absolute left-4 pointer-events-none bg-bg-1 px-1 transition-all
                          peer-focus:-translate-y-2 peer-focus:text-sm
                          ${price.length > 0 || errors.price || toggle
                            ? "-translate-y-2 text-sm"
                            : "translate-y-4 text-gray-500 dark:text-gray-400"
                          }
                          ${errors.price ? "text-red-500 peer-focus:text-red-500" : "peer-focus:text-[#6366f1]"}`}
                      >
                        {isCategoryDescendantOf(["jobs"]) ? "Plata" : "Cena"}
                      </label>

                      {/* Valuta - EUR (EUR / mes. za poslove) */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                        <span className="py-1 px-3 bg-bg-2 border border-bg-4 text-text-main rounded-full text-sm font-semibold select-none">
                          {isCategoryDescendantOf(["jobs"]) ? "EUR / mes." : "EUR"}
                        </span>
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="flex items-center gap-4">
                      {!isCategoryDescendantOf(["jobs"]) && (
                        <div className="flex items-center gap-2">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={toggle === "poklanjam"}
                              onChange={() => handleToggle("poklanjam")}
                            />
                            <div className="w-11 h-6 border border-bg-4 peer-checked:bg-[#5b42f3] rounded-full peer transition" />
                            <div className="absolute left-1 top-1 bg-bg-4 dark:bg-white peer-checked:bg-white w-4 h-4 rounded-full peer-checked:translate-x-5 transition" />
                          </label>
                          <span className="text-text-main text-sm">Poklanjam</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={toggle === "cena-na-upit"}
                            onChange={() => handleToggle("cena-na-upit")}
                          />
                          <div className="w-11 h-6 border border-bg-4 peer-checked:bg-[#5b42f3] rounded-full peer transition" />
                          <div className="absolute left-1 top-1 bg-bg-4 dark:bg-white peer-checked:bg-white w-4 h-4 rounded-full peer-checked:translate-x-5 transition" />
                        </label>
                        <span className="text-text-main text-sm">
                          {isCategoryDescendantOf(["jobs"]) ? "Plata na upit" : "Cena na upit"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {errors.price && (
                    <div className="flex items-center gap-2 mt-2 ml-4">
                      <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-text-main text-xs font-bold">!</div>
                      <span className="text-sm text-red-400">{errors.price}</span>
                    </div>
                  )}
                </div>
              )}

              {categorySlug && Object.keys(filters).length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(() => {
                      const bKey = Object.keys(filters).find(k => k === "brand" || k.endsWith("-brand"));
                      return Object.entries(filters)
                        .filter(([key]) => key !== "country" && key !== "city" && key !== "drzava" && key !== "grad" && key !== "salary" && key !== "salary-type")
                        .sort(([, fa], [, fb]) => (fa.id ?? 999) - (fb.id ?? 999))
                        .map(([key, filter]) => {
                          const isModel = key === "model" || key.endsWith("-model");
                          const isDisabled = isModel && (!bKey || !attributes[bKey]);
                          const isInline = filter.type === "range" || ["kilometers", "year", "cubicCapacity", "power"].includes(key);

                          // Special: Stanje (condition)
                          if (key === "condition") {
                            return (
                              <div key={key} className="relative group">
                                <button
                                  type="button"
                                  onClick={() => setIsStanjeModalOpen(true)}
                                  className={`w-full bg-bg-1 text-text-main px-4 py-4 rounded-full border transition-all text-left flex items-center justify-between
                                         ${errors.state ? "border-red-500" : (state ? "border-[#6366f1]" : "border-bg-4 h-[60px]")} cursor-pointer`}
                                >
                                  <span className={`${state ? "text-text-main" : "text-gray-500 opacity-0"} font-medium text-base truncate pr-2 capitalize`}>
                                    {state ? state.replace("-", " ") : "\u00A0"}
                                  </span>
                                  <ChevronRight size={18} className={`transition-colors shrink-0 ${state ? "text-[#6366f1]" : "text-[var(--bg-4)] group-hover:text-[#6366f1]"}`} />
                                </button>
                                <label
                                  className={`absolute left-4 pointer-events-none transition-all duration-200 px-1 bg-bg-1
                                    ${state || errors.state
                                      ? "-translate-y-2 top-0 text-sm"
                                      : "top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-base"
                                    }
                                    ${errors.state ? "text-red-500" : (state ? "text-[#6366f1]" : "text-gray-500 dark:text-gray-400")}`}
                                >
                                  Stanje
                                </label>
                              </div>
                            );
                          }

                          // Special: Oglašivač (seller)
                          if (key === "seller") {
                            return (
                              <div key={key} className="relative group">
                                <button
                                  type="button"
                                  onClick={() => setIsOglasivacModalOpen(true)}
                                  className={`w-full bg-bg-1 text-text-main px-4 py-4 rounded-full border transition-all text-left flex items-center justify-between
                                         ${attributes.seller ? "border-[#6366f1]" : "border-bg-4 h-[60px]"} cursor-pointer`}
                                >
                                  <span className={`${attributes.seller ? "text-text-main" : "text-gray-500 opacity-0"} font-medium text-base truncate pr-2`}>
                                    {attributes.seller === "individual" ? "Fizičko lice" : attributes.seller === "dealer" ? "Diler" : attributes.seller === "business" ? "Firma" : "\u00A0"}
                                  </span>
                                  <ChevronRight size={18} className={`transition-colors shrink-0 ${attributes.seller ? "text-[#6366f1]" : "text-[var(--bg-4)] group-hover:text-[#6366f1]"}`} />
                                </button>
                                <label
                                  className={`absolute left-4 pointer-events-none transition-all duration-200 px-1 bg-bg-1
                                    ${attributes.seller
                                      ? "-translate-y-2 top-0 text-sm"
                                      : "top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-base"
                                    }
                                    ${attributes.seller ? "text-[#6366f1]" : "text-gray-500 dark:text-gray-400"}`}
                                >
                                  Oglašivač
                                </label>
                              </div>
                            );
                          }

                          if (key.toLowerCase() === "cena" || filter.name?.toLowerCase() === "cena" || filter.label?.toLowerCase() === "cena") {
                            return null;
                          }

                          let displayValue = attributes[key];
                          let displayLabel = "";

                          if (Array.isArray(displayValue) && displayValue.length > 0) {
                            const displayedNames = displayValue.map(val => {
                              const opt = filter.options?.find((o: any) => o.slug === val || o === val);
                              return opt ? (opt.name || opt) : val;
                            });
                            displayLabel = displayedNames.slice(0, 2).join(", ");
                            if (displayedNames.length > 2) displayLabel += ` +${displayedNames.length - 2}`;
                          } else if (typeof displayValue === 'object' && displayValue !== null) {
                            if (displayValue.min || displayValue.max) {
                              displayLabel = `${displayValue.min || "0"} - ${displayValue.max || "max"}`;
                            } else if (displayValue.amount) {
                              displayLabel = displayValue.displayAmount
                                ? `${displayValue.displayAmount} ${displayValue.displayUnit || ""}`
                                : `${displayValue.amount} ${displayValue.unit || ""}`;
                            }
                          } else if (displayValue) {
                            const opt = filter.options?.find((o: any) => o.slug === displayValue || o === displayValue);
                            displayLabel = opt ? (opt.name || opt) : displayValue.toString();
                          }



                          if (isInline) {
                            const isFocused = focusedKey === key;
                            const hasValue = !!displayLabel;
                            const isOpen = activeInlineDropdown === key;
                            const options = filter.dropdownOptions || [];

                            if (key === "power") {
                              const isKW = powerUnit === "KW";
                              const kwValue = parseFloat(attributes[key] || "0");
                              const displayInput = isKW ? (attributes[key] || "") : (kwValue ? Math.round(kwValue * 1.35962).toString() : "");
                              const convertedText = kwValue ? (isKW ? `${Math.round(kwValue * 1.35962)} KS` : `${kwValue} KW`) : "";

                              return (
                                <div key={key} className="relative group">
                                  <div className="relative flex-1">
                                    <input
                                      type="text"
                                      value={displayInput}
                                      onChange={(e) => {
                                        const numbersOnly = e.target.value.replace(/\D/g, "");
                                        if (numbersOnly) {
                                          const parsed = parseInt(numbersOnly, 10);
                                          const newKw = isKW ? parsed : Math.round(parsed / 1.35962);
                                          setAttributes(prev => ({ ...prev, [key]: newKw.toString() }));
                                        } else {
                                          setAttributes(prev => ({ ...prev, [key]: "" }));
                                        }
                                        if (errors[key]) setErrors(prev => {
                                          const next = { ...prev };
                                          delete next[key];
                                          return next;
                                        });
                                      }}
                                      onFocus={() => setFocusedKey(key)}
                                      onBlur={() => setFocusedKey(null)}
                                      className={`w-full border rounded-full bg-transparent px-4 py-4 pr-40 text-text-main focus:border-[#6366f1] outline-none peer transition-colors duration-200
                                    ${errors[key] ? "border-red-500 focus:border-red-500" : "border-bg-4"}`}
                                    />
                                    <label
                                      className={`absolute left-4 pointer-events-none bg-bg-1 px-1 transition-all
                                    peer-focus:-translate-y-2 peer-focus:text-sm
                                    ${displayInput.length > 0 || errors[key] || isFocused
                                          ? "-translate-y-2 text-sm"
                                          : "translate-y-4 text-gray-500 dark:text-gray-400"
                                        }
                                    ${errors[key] ? "text-red-500 peer-focus:text-red-500" : "peer-focus:text-[#6366f1]"}`}
                                    >
                                      {filter.name || filter.label}
                                    </label>

                                    {convertedText && (
                                      <span className="absolute right-[110px] top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium pointer-events-none">
                                        {convertedText}
                                      </span>
                                    )}

                                    {/* Unit Select inside Input */}
                                    <div className={`absolute right-4 top-1/2 -translate-y-1/2 ${powerMenu ? "z-30" : "z-10"}`} ref={powerMenuRef}>
                                      <div className="relative">
                                        <button
                                          type="button"
                                          onClick={() => setPowerMenu((s) => !s)}
                                          className="py-1 px-3 bg-bg-2 border border-bg-4 text-text-main rounded-full flex gap-2 items-center hover:bg-bg-3 transition cursor-pointer text-sm"
                                        >
                                          {powerUnit}
                                          <ChevronDown size={14} />
                                        </button>
                                        {powerMenu && (
                                          <div className="absolute top-full right-0 bg-bg-2 border border-bg-4 rounded-xl mt-1 z-20 min-w-[80px]">
                                            <div
                                              onClick={() => {
                                                setPowerUnit("KW");
                                                setPowerMenu(false);
                                              }}
                                              className="px-4 py-2 hover:bg-[#2a2a2c] cursor-pointer text-text-main text-sm rounded-t-xl"
                                            >
                                              KW
                                            </div>
                                            <div
                                              onClick={() => {
                                                setPowerUnit("KS");
                                                setPowerMenu(false);
                                              }}
                                              className="px-4 py-2 hover:bg-[#2a2a2c] cursor-pointer text-text-main text-sm rounded-b-xl"
                                            >
                                              KS
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {errors[key] && (
                                    <div className="flex items-center gap-2 mt-2 ml-4">
                                      <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-text-main text-xs font-bold">!</div>
                                      <span className="text-sm text-red-400">{errors[key]}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            }

                            return (
                              <div key={key} className="relative group">
                                <input
                                  type="text"
                                  value={displayLabel || ""}
                                  onChange={(e) => {
                                    const numbersOnly = e.target.value.replace(/\D/g, "");
                                    setAttributes(prev => ({ ...prev, [key]: numbersOnly }));
                                    if (errors[key]) setErrors(prev => {
                                      const next = { ...prev };
                                      delete next[key];
                                      return next;
                                    });
                                  }}
                                  onFocus={() => {
                                    setFocusedKey(key);
                                    setActiveInlineDropdown(key);
                                  }}
                                  onBlur={() => {
                                    setFocusedKey(null);
                                    setTimeout(() => setActiveInlineDropdown(null), 200);
                                  }}
                                  className={`w-full bg-bg-1 text-text-main px-4 py-4 rounded-full border transition-all text-left outline-none focus:border-[#6366f1]
                                          ${errors[key] ? "border-red-500 focus:border-red-500" : (hasValue || isFocused ? "border-[#6366f1]" : "border-bg-4 h-[60px]")}`}
                                />
                                {options.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setActiveInlineDropdown(isOpen ? null : key);
                                    }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--bg-4)] hover:text-[#6366f1] transition-colors p-1"
                                  >
                                    <ChevronDown size={18} className={`opacity-60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                                  </button>
                                )}

                                {/* Inline Dropdown */}
                                <AnimatePresence>
                                  {isOpen && options.length > 0 && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      className="absolute top-[110%] left-0 w-full bg-bg-1 border border-bg-2 rounded-2xl shadow-2xl z-30 max-h-[200px] overflow-y-auto custom-scrollbar"
                                    >
                                      {options.map((opt: string) => (
                                        <div
                                          key={opt}
                                          onClick={() => {
                                            setAttributes(prev => ({ ...prev, [key]: opt }));
                                            setActiveInlineDropdown(null);
                                          }}
                                          className="px-4 py-3 text-text-main hover:bg-bg-2 cursor-pointer transition-colors border-b border-bg-2 last:border-0"
                                        >
                                          {opt}
                                        </div>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                <label
                                  className={`absolute left-4 pointer-events-none transition-all duration-200 px-1 bg-bg-1
                                ${hasValue || isFocused || errors[key]
                                      ? "-translate-y-2 top-0 text-sm"
                                      : "top-[30px] -translate-y-1/2 text-gray-500 dark:text-gray-400 text-base"
                                    }
                                ${errors[key] ? "text-red-500" : (hasValue || isFocused ? "text-[#6366f1]" : "text-gray-500 dark:text-gray-400")}`}
                                >
                                  {filter.name || filter.label}
                                </label>
                                {errors[key] && (
                                  <div className="flex items-center gap-2 mt-2 ml-4">
                                    <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-text-main text-xs font-bold">!</div>
                                    <span className="text-sm text-red-400">{errors[key]}</span>
                                  </div>
                                )}
                              </div>
                            );
                          }

                          return (
                            <div key={key} className={`relative group ${isDisabled ? "opacity-30" : ""}`}>
                              <button
                                type="button"
                                onClick={() => {
                                  if (isDisabled) return;
                                  setActiveFilterKey(key);
                                  setIsSelectorModalOpen(true);
                                }}
                                disabled={isDisabled}
                                className={`w-full bg-bg-1 text-text-main px-4 py-4 rounded-full border transition-all text-left flex items-center justify-between
                                          ${errors[key] ? "border-red-500" : (displayLabel ? "border-[#6366f1]" : "border-bg-4 h-[60px]")}
                                          ${isDisabled ? "cursor-not-allowed" : "cursor-pointer"}`}
                              >
                                <span className={`${displayLabel ? "text-text-main" : "text-gray-500 opacity-0"} font-medium text-base truncate pr-2`}>
                                  {displayLabel || "\u00A0"}
                                </span>
                                <ChevronRight size={18} className={`transition-colors shrink-0 ${displayLabel ? "text-[#6366f1]" : "text-[var(--bg-4)] group-hover:text-[#6366f1]"}`} />
                              </button>
                              <label
                                className={`absolute left-4 pointer-events-none transition-all duration-200 px-1 bg-bg-1
                              ${displayLabel || errors[key]
                                    ? "-translate-y-2 top-0 text-sm"
                                    : "top-[30px] -translate-y-1/2 text-gray-500 dark:text-gray-400 text-base"
                                  }
                              ${errors[key] ? "text-red-500" : (displayLabel ? "text-[#6366f1]" : "text-gray-500 dark:text-gray-400")}`}
                              >
                                {filter.name || filter.label}
                              </label>
                              {errors[key] && (
                                <div className="flex items-center gap-2 mt-2 ml-4">
                                  <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-text-main text-xs font-bold">!</div>
                                  <span className="text-sm text-red-400">{errors[key]}</span>
                                </div>
                              )}
                            </div>
                          );
                        })
                    })()}
                  </div>
                </div>
              )}



              {/* ✅ OPIS SA TOOLBAROM */}
              <div>
                <label className={`mb-2 block transition-colors ${errors.description ? "text-red-500" : "text-text-main"}`}>Opis</label>

                {/* Toolbar */}
                <div className={`border rounded-3xl overflow-hidden transition-colors relative
                  ${errors.description ? "border-red-500 focus-within:border-red-500" : editorFocused ? "border-[#6366f1]" : "border-bg-4"}`}>
                  <div className={`flex items-center justify-between px-3 py-2 border-b transition-colors 
                    ${errors.description ? "border-red-500 bg-red-500/5" : "border-bg-4"}`}>
                    <div className="flex items-center gap-2">
                      <ToolbarIcon
                        icon={<Bold size={18} />}
                        active={format.bold}
                        onClick={() => toggleFormat("bold")}
                      />
                      <ToolbarIcon
                        icon={<Italic size={18} />}
                        active={format.italic}
                        onClick={() => toggleFormat("italic")}
                      />
                      <ToolbarIcon
                        icon={<Underline size={18} />}
                        active={format.underline}
                        onClick={() => toggleFormat("underline")}
                      />
                      <div className="w-px h-4 bg-bg-4 mx-1" />
                      <ToolbarIcon
                        icon={<List size={18} />}
                        active={format.bullets}
                        onClick={() => toggleFormat("bullets")}
                      />
                      <ToolbarIcon
                        icon={<ListOrdered size={18} />}
                        active={format.numbers}
                        onClick={() => toggleFormat("numbers")}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <ToolbarIcon icon={<Undo2 size={18} />} onClick={undo} />
                      <ToolbarIcon icon={<Redo2 size={18} />} onClick={redo} />
                    </div>
                  </div>

                  {/* Polje za unos */}
                  <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    onInput={(e) => {
                      let text = e.currentTarget.innerText || "";
                      if (text.length > 5000) {
                        e.currentTarget.innerText = text.substring(0, 5000);
                        text = e.currentTarget.innerText;

                        const sel = window.getSelection();
                        const range = document.createRange();
                        if (sel && e.currentTarget.lastChild) {
                          range.selectNodeContents(e.currentTarget);
                          range.collapse(false);
                          sel.removeAllRanges();
                          sel.addRange(range);
                        }
                      }
                      setDescription(e.currentTarget.innerHTML);
                      setCharCount(text.length);
                      if (errors.description) setErrors(prev => ({ ...prev, description: "" }));
                    }}
                    onPaste={(e) => {
                      const text = e.currentTarget.innerText || "";
                      if (text.length >= 5000) {
                        e.preventDefault();
                      } else {
                        const pasteData = e.clipboardData.getData("text/plain");
                        if (text.length + pasteData.length > 5000) {
                          e.preventDefault();
                          const allowed = 5000 - text.length;
                          document.execCommand("insertText", false, pasteData.substring(0, allowed));
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      const text = e.currentTarget.innerText || "";
                      if (text.length >= 5000 && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                      }
                      if (e.key === " " || e.key === "Enter") {
                        setTimeout(() => applyEditorLinkify(), 0);
                      }
                    }}
                    onFocus={() => setEditorFocused(true)}
                    onBlur={() => setEditorFocused(false)}
                    className="w-full p-4 text-text-main outline-none min-h-[150px] pb-8 editor-content"
                  />

                  {/* Character Counter */}
                  <div className={`absolute bottom-2 right-4 text-xs font-medium ${charCount >= 5000 ? "text-red-500" : "text-gray-500"}`}>
                    {charCount}/5000
                  </div>
                </div>
                {errors.description && (
                  <div className="flex items-center gap-2 mt-2 ml-4">
                    <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-text-main text-xs font-bold">!</div>
                    <span className="text-sm text-red-400">{errors.description}</span>
                  </div>
                )}
              </div>

              {/* ✅ KONTAKT INFORMACIJE */}
              <div className="pt-6 space-y-6">
                <h2 className="text-xl font-bold text-text-main mb-2">Kontakt informacije</h2>

                {/* Država i Grad side-by-side on desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Država */}
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => setIsCountryModalOpen(true)}
                      className={`w-full bg-bg-1 text-text-main px-4 py-4 rounded-full border transition-all text-left flex items-center justify-between cursor-pointer ${errors.country ? "border-red-500" : (selectedCountry ? "border-[#6366f1]" : "border-bg-4 h-[60px]")
                        }`}
                    >
                      <span className={`${selectedCountry ? "text-text-main" : "text-gray-500 opacity-0"} font-medium text-base truncate pr-2`}>
                        {selectedCountry || "\u00A0"}
                      </span>
                      <ChevronRight size={18} className={`transition-colors shrink-0 ${selectedCountry ? "text-[#6366f1]" : "text-[var(--bg-4)] group-hover:text-[#6366f1]"}`} />
                    </button>
                    <label
                      className={`absolute left-4 pointer-events-none transition-all duration-200 px-1 bg-bg-1
                        ${selectedCountry || errors.country
                          ? "-translate-y-2 top-0 text-sm"
                          : "top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-base"
                        }
                        ${errors.country ? "text-red-500" : (selectedCountry ? "text-[#6366f1]" : "text-gray-500 dark:text-gray-400")}`}
                    >
                      Država
                    </label>
                    {errors.country && (
                      <div className="flex items-center gap-2 mt-2 ml-4">
                        <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-text-main text-xs font-bold">!</div>
                        <span className="text-sm text-red-400">{errors.country}</span>
                      </div>
                    )}
                  </div>

                  {/* Grad */}
                  <div className="relative">
                    <input
                      type="text"
                      name="city"
                      value={cityQuery}
                      onChange={(e) => {
                        setCityQuery(e.target.value);
                        setSelectedCity("");
                        if (errors.city) setErrors(prev => ({ ...prev, city: "" }));
                      }}
                      className={`w-full border rounded-full bg-transparent px-4 py-4 text-text-main focus:border-[#6366f1] outline-none peer transition-colors duration-200
                        ${errors.city ? "border-red-500 focus:border-red-500" : "border-bg-4 h-[60px]"}`}
                    />
                    <label
                      className={`absolute left-4 pointer-events-none bg-bg-1 px-1 transition-all
                        peer-focus:-translate-y-2 peer-focus:text-sm
                        ${cityQuery.length > 0 || errors.city
                          ? "-translate-y-2 text-sm"
                          : "translate-y-4 text-gray-500 dark:text-gray-400 text-base"
                        }
                        ${errors.city ? "text-red-500 peer-focus:text-red-500" : "peer-focus:text-[#6366f1]"}`}
                    >
                      Grad
                    </label>
                    {errors.city && (
                      <div className="flex items-center gap-2 mt-2 ml-4">
                        <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-text-main text-xs font-bold">!</div>
                        <span className="text-sm text-red-400">{errors.city}</span>
                      </div>
                    )}
                    <AnimatePresence>
                      {citySuggestions.length > 0 && (
                        <motion.ul
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.15 }}
                          className="absolute z-20 left-0 right-0 bg-bg-2 border border-bg-3 mt-2 max-h-48 overflow-y-auto rounded-3xl shadow-xl custom-modal-scrollbar"
                        >
                          {citySuggestions.map((c) => {
                            const isSelected = selectedCity === c;
                            return (
                              <li
                                key={c}
                                onClick={() => {
                                  setSelectedCity(c);
                                  setCityQuery(c);
                                  setCitySuggestions([]);
                                  if (errors.city) setErrors(prev => ({ ...prev, city: "" }));
                                }}
                                className={`px-6 py-3 cursor-pointer text-sm transition-colors ${isSelected
                                  ? "text-[#6366f1] font-semibold bg-[#6366f1]/10"
                                  : "text-text-main hover:bg-bg-3"
                                  }`}
                              >
                                {c}
                              </li>
                            );
                          })}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Adresa */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      name="street"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full border border-bg-4 rounded-full bg-transparent px-4 py-4 text-text-main focus:border-[#6366f1] outline-none peer transition-colors duration-200"
                    />
                    <label
                      className={`absolute left-4 pointer-events-none bg-bg-1 px-1 transition-all
                        peer-focus:-translate-y-2 peer-focus:text-sm
                        ${street.length > 0
                          ? "-translate-y-2 text-sm"
                          : "translate-y-4 text-gray-500 dark:text-gray-400"
                        }
                        peer-focus:text-[#6366f1]`}
                    >
                      Adresa <span className="text-gray-400 text-xs">(opciono)</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2 pl-4 sm:pl-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={showStreet}
                        onChange={(e) => setShowStreet(e.target.checked)}
                      />
                      <div className="w-11 h-6 border border-bg-4 peer-checked:bg-[#5b42f3] hover:bg-[#4b35d6] rounded-full peer transition" />
                      <div className="absolute left-1 top-1 bg-bg-4 dark:bg-white peer-checked:bg-white w-4 h-4 rounded-full peer-checked:translate-x-5 transition" />
                    </label>
                    <span className="text-text-main text-sm whitespace-nowrap">Prikaži adresu</span>
                  </div>
                </div>

                {/* Telefon */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      name="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full border border-bg-4 rounded-full bg-transparent px-4 py-4 text-text-main focus:border-[#6366f1] outline-none peer transition-colors duration-200"
                    />
                    <label
                      className={`absolute left-4 pointer-events-none bg-bg-1 px-1 transition-all
                        peer-focus:-translate-y-2 peer-focus:text-sm
                        ${phone.length > 0
                          ? "-translate-y-2 text-sm"
                          : "translate-y-4 text-gray-500 dark:text-gray-400"
                        }
                        peer-focus:text-[#6366f1]`}
                    >
                      Telefon <span className="text-gray-400 text-xs">(opciono)</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2 pl-4 sm:pl-0">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={showPhone}
                        onChange={(e) => setShowPhone(e.target.checked)}
                      />
                      <div className="w-11 h-6 border border-bg-4 peer-checked:bg-[#5b42f3] hover:bg-[#4b35d6] rounded-full peer transition" />
                      <div className="absolute left-1 top-1 bg-bg-4 dark:bg-white peer-checked:bg-white w-4 h-4 rounded-full peer-checked:translate-x-5 transition" />
                    </label>
                    <span className="text-text-main text-sm whitespace-nowrap">Prikaži broj telefona</span>
                  </div>
                </div>
              </div>

              {/* ✅ DUGMAD */}
              <div className="flex flex-col-reverse md:flex-row justify-between gap-3 pt-4">
                <button
                  type="button"
                  className="w-full md:w-auto px-14 md:px-20 py-4 rounded-full bg-bg-4 text-text-main hover:bg-[#5a5a5c] cursor-pointer transition-colors"
                  onClick={() => {
                    isRedirectingRef.current = true;
                    if (categorySlug) {
                      sessionStorage.setItem("adFlow_restoreSlug", categorySlug);
                    }
                    router.push(`/ad/${action}${query}`);
                  }}
                >
                  Nazad
                </button>
                <button
                  type="button"
                  disabled={images.some(img => img.uploading)}
                  className="w-full md:w-auto px-14 md:px-20 py-4 rounded-full bg-[#5b42f3] text-white font-semibold transition-all duration-300 hover:bg-[#4b35d6] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[160px]"
                  onClick={handleNext}
                >
                  {images.some(img => img.uploading) ? <><Loader /> Otprema...</> : "Nastavi"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div >
      <AnimatePresence>
        {isSelectorModalOpen && activeFilterKey && filters[activeFilterKey] && (
          <FilterOptionsModal
            isOpen={isSelectorModalOpen}
            onClose={() => setIsSelectorModalOpen(false)}
            filterKey={activeFilterKey}
            filter={
              (() => {
                const isModelKey = activeFilterKey === "model" || activeFilterKey?.endsWith("-model");
                const isBrandKey = activeFilterKey === "brand" || activeFilterKey?.endsWith("-brand");
                const pairedBrandKey = isModelKey
                  ? (activeFilterKey === "model" ? "brand" : activeFilterKey!.replace(/-model$/, "-brand"))
                  : null;
                if (isModelKey) {
                  const selectedBrand = pairedBrandKey ? attributes[pairedBrandKey] : undefined;
                  return { ...filters[activeFilterKey!], options: brands.find((b: any) => b.brand === selectedBrand)?.models || [], type: "model-selector" };
                }
                if (isBrandKey) return { ...filters[activeFilterKey!], type: "brand-selector" };
                return filters[activeFilterKey!];
              })()
            }
            value={attributes[activeFilterKey]}
            onSave={(key, val) => {
              let finalVal = val;
              const filter = filters[key];

              if (filter?.type === "range-with-unit") {
                const unit = val?.unit || filter.default_unit || "kw";
                const amount = val?.amount || "";

                if (unit === "ps") {
                  const kWValue = amount ? Math.round(Number(amount) / 1.35962).toString() : "";
                  finalVal = {
                    ...val,
                    amount: kWValue,
                    unit: "kw",
                    displayAmount: amount,
                    displayUnit: "ps"
                  };
                } else {
                  finalVal = {
                    ...val,
                    amount: amount,
                    unit: "kw",
                    displayAmount: null,
                    displayUnit: null
                  };
                }
              }

              setAttributes(prev => {
                const next = { ...prev, [key]: finalVal };
                const isBrandKey = key === "brand" || key.endsWith("-brand");
                if (isBrandKey) {
                  const modelKey = Object.keys(filters).find(k => k === "model" || k.endsWith("-model"));
                  if (modelKey) next[modelKey] = "";
                }
                return next;
              });
              if (errors[key]) setErrors(prev => {
                const next = { ...prev };
                delete next[key];
                return next;
              });
            }}
            brands={brands}
            categorySlug={categorySlug}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isCountryModalOpen && (
          <FilterOptionsModal
            isOpen={isCountryModalOpen}
            onClose={() => setIsCountryModalOpen(false)}
            filterKey="country"
            filter={{
              type: "radio",
              name: "Izaberite državu",
              options: (Object.keys(locations).length > 0 ? Object.keys(locations) : ["Srbija"]).map(c => ({
                slug: c,
                name: c
              }))
            }}
            value={selectedCountry}
            onSave={(key, val) => {
              setSelectedCountry(val);
              setCityQuery("");
              setSelectedCity("");
              if (errors.country) setErrors(prev => {
                const next = { ...prev };
                delete next.country;
                return next;
              });
            }}
            categorySlug={categorySlug}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isStanjeModalOpen && (
          <FilterOptionsModal
            isOpen={isStanjeModalOpen}
            onClose={() => setIsStanjeModalOpen(false)}
            filterKey="stanje"
            filter={{
              type: "radio",
              name: "Stanje",
              options: [
                { slug: "novo", name: "Novo" },
                { slug: "kao-novo", name: "Kao novo" },
                { slug: "polovno", name: "Polovno" },
                { slug: "neispravno", name: "Neispravno" },
                { slug: "osteceno", name: "Oštećeno" },
              ]
            }}
            value={state}
            onSave={(key, val) => {
              selectState(val);
            }}
            categorySlug={categorySlug}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isOglasivacModalOpen && (
          <FilterOptionsModal
            isOpen={isOglasivacModalOpen}
            onClose={() => setIsOglasivacModalOpen(false)}
            filterKey="seller"
            filter={{
              type: "radio",
              name: "Oglašivač",
              options: [
                { slug: "individual", name: "Fizičko lice" },
                { slug: "dealer", name: "Diler" },
                { slug: "business", name: "Firma" },
              ]
            }}
            value={attributes.seller}
            onSave={(key, val) => {
              setAttributes(prev => ({ ...prev, seller: val }));
            }}
            categorySlug={categorySlug}
          />
        )}
      </AnimatePresence>
    </main >
  );
}

function DraggableImage({ img, idx, count, rotateImage, removeImage, onReorder }: {
  img: ImgItem;
  idx: number;
  count: number;
  rotateImage: (idx: number) => void;
  removeImage: (idx: number) => void;
  onReorder: (from: number, to: number) => void;
}) {
  const [isDraggingLocal, setIsDraggingLocal] = useState(false);
  const dragControls = useDragControls();
  const lastReorderTime = useRef(0);
  const gridInfo = useRef<{
    rect: DOMRect;
    cols: number;
    cellW: number;
    cellH: number;
  } | null>(null);

  const handleDragStart = () => {
    setIsDraggingLocal(true);
    const grid = document.getElementById('image-grid');
    if (!grid) return;

    const rect = grid.getBoundingClientRect();
    const firstItem = grid.children[0]?.getBoundingClientRect();
    const secondItem = grid.children[1]?.getBoundingClientRect();

    if (!firstItem) return;

    let cols = 1;
    if (secondItem && secondItem.top === firstItem.top) {
      const items = Array.from(grid.children);
      for (let i = 1; i < items.length; i++) {
        if (items[i].getBoundingClientRect().top !== firstItem.top) break;
        cols++;
      }
    }

    gridInfo.current = {
      rect,
      cols,
      cellW: rect.width / cols,
      cellH: firstItem.height + (grid.children[cols] ? grid.children[cols].getBoundingClientRect().top - firstItem.bottom : 16)
    };
  };

  const handleDrag = (event: any, info: any) => {
    const now = Date.now();
    if (now - lastReorderTime.current < 30) return;

    const config = gridInfo.current;
    if (!config) return;

    const pointerX = info.point.x;
    const pointerY = info.point.y;

    const relX = pointerX - config.rect.left;
    const relY = pointerY - config.rect.top;

    const col = Math.floor(relX / config.cellW);
    const row = Math.floor(relY / config.cellH);

    const finalCol = Math.max(0, Math.min(config.cols - 1, col));
    const finalRow = Math.max(0, row);

    let closestIndex = finalRow * config.cols + finalCol;
    closestIndex = Math.max(0, Math.min(count - 1, closestIndex));

    if (closestIndex !== idx) {
      lastReorderTime.current = now;
      onReorder(idx, closestIndex);
    }
  };

  return (
    <motion.div
      layout
      drag
      dragListener={false}
      dragControls={dragControls}
      dragSnapToOrigin={true}
      dragMomentum={false}
      dragElastic={0.1}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={() => setIsDraggingLocal(false)}
      initial={false}
      animate={{
        scale: 1,
        zIndex: isDraggingLocal ? 50 : 1,
        boxShadow: isDraggingLocal ? "0 25px 50px -12px rgba(0, 0, 0, 0.5)" : "0 0px 0px 0px rgba(0, 0, 0, 0)"
      }}
      whileDrag={{
        cursor: "grabbing"
      }}
      whileTap={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        mass: 0.8
      }}
      className="relative w-full h-24 md:h-32 bg-bg-2 border border-bg-4 rounded-3xl overflow-hidden flex flex-col items-center justify-center group select-none transition-shadow duration-200"
    >
      <img
        src={img.url}
        alt={`preview-${idx}`}
        style={{ transform: `rotate(${img.rotation}deg)` }}
        className="object-cover w-full h-full pointer-events-none transition-transform duration-300"
      />
      {img.uploading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70">
          <Loader />
        </div>
      )}

      {/* 6 Dots Move Handle - Positioned at bottom center */}
      <div
        onPointerDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          dragControls.start(e);
        }}
        className="absolute bottom-1.5 left-1/2 -translate-x-1/2 px-2.5 py-1.5 bg-black/50 backdrop-blur-md rounded-full cursor-grab active:cursor-grabbing hover:bg-black/70 transition-colors z-20 touch-none"
      >
        <div className="grid grid-cols-3 gap-[2px]">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-1 h-1 bg-white rounded-full opacity-80" />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); rotateImage(idx); }}
        className="absolute top-1.5 left-1.5 bg-black/50 text-white w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/70 transition cursor-pointer z-10"
        title="Rotiraj sliku"
      >
        <RotateCw size={10} />
      </button>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
        className="absolute top-1.5 right-1.5 bg-black/50 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/70 transition cursor-pointer z-10"
      >
        ✕
      </button>
    </motion.div>
  );
}

function ToolbarIcon({
  icon,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`p-2 rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center
        ${active ? "bg-bg-2 text-[#6366f1]" : "text-text-main hover:bg-bg-2"}`}
    >
      <div className={`transition-colors flex items-center justify-center ${active ? "opacity-100" : "opacity-60 hover:opacity-100"}`}>
        {icon}
      </div>
    </button>
  );
}
