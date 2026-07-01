"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import AdStepProgress from "./AdStepProgress"
import { ChevronDown, ChevronRight, ArrowLeft, ChevronLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"

interface Category {
  name: string
  slug?: string
  subslug?: string
  childslug?: string
  finalslug?: string
  id?: number
  icon?: string
  subcategories?: Category[]
  types?: Category[]
}

const SLUG_MAPPING: Record<string, string> = {
  vehicles: "auto-moto",
  "real-estate": "real-estate",
  jobs: "jobs",
};

const FallbackIcons: Record<string, string> = {
  "Vozila": "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/icons/car.svg",
  "Nekretnine": "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/icons/house.svg",
  "Poslovi": "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/icons/briefcase.svg",
};

export default function AddListing() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const action = params?.action as string || "add";
  const adId = searchParams?.get('adId')
  const query = action === 'edit' && adId ? `?adId=${adId}` : ''
  const { user, loading: authLoading, sessionToken } = useAuth()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth")
    }
  }, [user, authLoading, router])

  const getBaseUrl = () => {
    return `/ad/${action}/form${query}`;
  };

  const [expandedCat, setExpandedCat] = useState<string | null>(null)
  const [rootCategories, setRootCategories] = useState<Category[]>([])
  const [navigationStack, setNavigationStack] = useState<Category[][]>([])
  const [direction, setDirection] = useState(1)
  const [selectedSubCat, setSelectedSubCat] = useState<string | null>(null)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      const restored = sessionStorage.getItem("adFlow_restoreSlug");
      sessionStorage.removeItem("adFlow_restoreSlug");
      if (restored) return restored;
      // Fresh start: mark new session synchronously before any render
      sessionStorage.setItem("adFlow_newSession", "true");
      sessionStorage.removeItem("adFlow_toasted");
      localStorage.removeItem("adFlow_details");
      localStorage.removeItem("adFlow_selectedSlug");
      localStorage.removeItem("adFlow_selectedCategoryPath");
      localStorage.removeItem("adFlow_draftId");
    }
    return null;
  })
  const [isRestoring, setIsRestoring] = useState(!!selectedSlug)
  const [rootSlug, setRootSlug] = useState<string | null>(null)
  const [categoryPath, setCategoryPath] = useState<Category[]>([])

  const isRedirectingRef = useRef(false)
  const selectedSlugRef = useRef<string | null>(null)
  const isFreshStartRef = useRef(
    typeof window !== "undefined" && !sessionStorage.getItem("adFlow_restoreSlug")
      ? sessionStorage.getItem("adFlow_newSession") === "true"
      : false
  )

  // Keep ref in sync so cleanup can read the latest value
  useEffect(() => {
    selectedSlugRef.current = selectedSlug;
  }, [selectedSlug]);

  // Fresh start: clear ref once available
  useEffect(() => {
    if (action !== "add" || !isFreshStartRef.current) return;
    isFreshStartRef.current = false;
  }, [action]);

  // Toast fires only ONCE per flow session when leaving the flow
  useEffect(() => {
    return () => {
      const isInternal = sessionStorage.getItem("adFlow_navigatingInternal") === "true";
      sessionStorage.removeItem("adFlow_navigatingInternal");
      const hasQualifying = localStorage.getItem("adFlow_hasQualifyingFields") === "true";
      if (!isRedirectingRef.current && !isInternal && hasQualifying && action === "add") {
        if (!sessionStorage.getItem("adFlow_toasted")) {
          sessionStorage.setItem("adFlow_toasted", "true");
          toast.success("Oglas je sačuvan kao radna verzija");
        }
      }
    };
  }, [action]);


  const handleCancelClick = () => {
    router.push("/");
  }

  useEffect(() => {
    if (selectedSlug) {
      localStorage.setItem("adFlow_selectedSlug", selectedSlug);
    } else {
      localStorage.removeItem("adFlow_selectedSlug");
    }
    window.dispatchEvent(new Event("adFlowUpdate"));
  }, [selectedSlug])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/data/categories.json`)
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
        let rawData: Category[] = await res.json()

        const excludeSlugs = ["nearby-ads", "all-ads", "gift"]
        rawData = rawData.filter(cat => !excludeSlugs.includes(cat.slug || ""))

        setRootCategories(rawData)
      } catch (error) {
        console.error(`Failed to fetch categories data:`, error)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (expandedCat && rootCategories.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`cat-${expandedCat}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, [expandedCat, rootCategories]);

  useEffect(() => {
    if (rootCategories.length > 0 && !expandedCat && selectedSlug) {
      const savedSlug = selectedSlug;
      const findPath = (cats: Category[], targetSlug: string, currentStack: Category[][] = [], rootName = "", rootSlugVal: string | null = null, currentPath: Category[] = []): any => {
        for (const cat of cats) {
          const catSlug = cat.slug || cat.subslug || cat.childslug || cat.finalslug;
          if (catSlug === targetSlug) {
            return { rootCat: rootName || cat.name, rootSlug: rootSlugVal || catSlug, subCat: cat.name, stack: currentStack, path: [...currentPath, cat] };
          }
          const children = cat.subcategories || cat.types;
          if (children && children.length > 0) {
            const res = findPath(children, targetSlug, [...currentStack, children], rootName || cat.name, rootSlugVal || catSlug, [...currentPath, cat]);
            if (res) return res;
          }
        }
        return null;
      };

      const foundPath = findPath(rootCategories, savedSlug);
      if (foundPath) {
        setExpandedCat(foundPath.rootCat);
        setRootSlug(foundPath.rootSlug);
        setSelectedSubCat(foundPath.subCat);
        setNavigationStack(foundPath.stack);
        const mainCatObj = rootCategories.find(c => c.name === foundPath.rootCat);
        if (mainCatObj && !foundPath.path.some((c: Category) => c.name === mainCatObj.name)) {
          setCategoryPath([mainCatObj, ...foundPath.path]);
        } else {
          setCategoryPath(foundPath.path);
        }

        setTimeout(() => {
          const el = document.getElementById(`cat-${foundPath.rootCat}`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
      setTimeout(() => {
        setIsRestoring(false);
      }, 500);
    }
  }, [rootCategories, selectedSlug]);

  const handleMainCategoryClick = (cat: Category) => {
    if (expandedCat === cat.name) {
      setExpandedCat(null)
      setNavigationStack([])
      setRootSlug(null)
      setCategoryPath([])
    } else {
      setExpandedCat(cat.name)
      setDirection(1)
      setNavigationStack([cat.subcategories || cat.types || []])
      setCategoryPath([cat])
      const slug = cat.slug || null
      setRootSlug(slug)
    }
  }

  const handleSubCategoryClick = (cat: Category) => {
    const subCats = cat.subcategories || cat.types
    setSelectedSubCat(cat.name)
    const currentSlug = cat.slug || cat.subslug || cat.childslug || cat.finalslug
    if (currentSlug) setSelectedSlug(currentSlug)

    if (subCats && subCats.length > 0) {
      setDirection(1)
      setNavigationStack([...navigationStack, subCats])
      setCategoryPath([...categoryPath, cat])
    } else {
      isRedirectingRef.current = true;
      if (currentSlug) {
        sessionStorage.setItem("adFlow_restoreSlug", currentSlug);
        const fullPath = [...categoryPath, cat].map(c => c.slug || c.subslug || c.childslug || c.finalslug).filter(Boolean).join('/');
        localStorage.setItem("adFlow_selectedCategoryPath", fullPath);
      }
      router.push(getBaseUrl())
    }
  }

  const goBack = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (navigationStack.length > 1) {
      setDirection(-1)
      setNavigationStack(navigationStack.slice(0, -1))
      const newPath = categoryPath.slice(0, -1)
      setCategoryPath(newPath)
      if (newPath.length > 1) {
        const parent = newPath[newPath.length - 1]
        setSelectedSubCat(parent.name)
        const parentSlug = parent.slug || parent.subslug || parent.childslug || parent.finalslug
        if (parentSlug) setSelectedSlug(parentSlug)
      } else {
        setSelectedSubCat(null)
        setSelectedSlug(null)
      }
    } else {
      setExpandedCat(null)
      setNavigationStack([])
      setCategoryPath([])
      setSelectedSubCat(null)
      setSelectedSlug(null)
      setRootSlug(null)
    }
  }

  const currentLevel = navigationStack.length > 0 ? navigationStack[navigationStack.length - 1] : []

  const slideVariants = {
    enter: (d: number) => ({
      x: d > 0 ? "110%" : "-110%",
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (d: number) => ({
      x: d > 0 ? "-110%" : "110%",
      opacity: 0
    })
  }

  const springTransition: any = {
    type: "spring",
    damping: 25,
    stiffness: 200
  }

  return (
    <main className="min-h-screen bg-bg-1 flex flex-col items-center pt-4 md:pt-6">
      <div className="w-full max-w-[800px] px-5 md:px-10 flex flex-col">
        <AdStepProgress currentStep={1} />

        <div className="flex flex-col gap-4 pt-5 md:pt-10">
          {authLoading || rootCategories.length === 0 ? (
            <div className="flex flex-col gap-4 animate-pulse">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-5 md:p-8 rounded-3xl border border-bg-4 bg-bg-2/50 w-full h-[80px] md:h-[104px]">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-bg-4" />
                    <div className="h-5 w-32 bg-bg-4 rounded-full" />
                  </div>
                  <div className="w-6 h-6 rounded-full bg-bg-4" />
                </div>
              ))}
            </div>
          ) : (
            rootCategories.map((cat) => {
              const isExpanded = expandedCat === cat.name
              const hasSubcategories = (cat.subcategories && cat.subcategories.length > 0) || (cat.types && cat.types.length > 0)

              return (
                <div key={cat.name} id={`cat-${cat.name}`} className="flex flex-col rounded-3xl border border-bg-4 bg-bg-2 overflow-hidden transition-colors hover:border-[#6366f1]">
                  <button
                    onClick={() => {
                      if (hasSubcategories) {
                        handleMainCategoryClick(cat)
                      } else {
                        const slug = cat.slug || null
                        if (slug) {
                          localStorage.setItem("adFlow_selectedCategoryPath", slug);
                        }
                        setSelectedSlug(slug);
                        setRootSlug(slug);
                        isRedirectingRef.current = true;
                        router.push(getBaseUrl());
                      }
                    }}
                    className="flex items-center justify-between p-5 md:p-8 transition cursor-pointer w-full text-left relative z-10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 relative">
                        <Image
                          src={FallbackIcons[cat.name] || cat.icon || "https://pbkhmmkpecbhghuwrzxd.supabase.co/storage/v1/object/public/images/icons/all-ads.svg"}
                          alt={cat.name}
                          width={40}
                          height={40}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-text-main font-medium text-lg">{cat.name}</span>
                    </div>
                    {hasSubcategories && (
                      <motion.div
                        initial={isRestoring ? { rotate: isExpanded ? 180 : 0 } : false}
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: isRestoring ? 0 : 0.3 }}
                      >
                        <ChevronDown className="text-[#8e8e93] w-6 h-6" />
                      </motion.div>
                    )}
                  </button>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={isRestoring ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: isRestoring ? 0 : 0.3, ease: "easeInOut" }}
                        className="overflow-hidden bg-bg-2"
                      >
                        <div className="p-4 relative overflow-hidden">
                          <AnimatePresence mode="popLayout" custom={direction}>
                            <motion.div
                              key={navigationStack.length}
                              custom={direction}
                              variants={slideVariants}
                              initial={isRestoring ? "center" : "enter"}
                              animate="center"
                              exit="exit"
                              transition={isRestoring ? { duration: 0 } : springTransition}
                              className="w-full"
                            >
                              {navigationStack.length > 1 && (
                                <div className="flex items-center gap-3 mb-4">
                                  <button
                                    onClick={goBack}
                                    type="button"
                                    className="flex items-center justify-center w-10 h-10 rounded-full bg-bg-3 hover:bg-bg-4 text-text-main transition-colors cursor-pointer border border-transparent"
                                  >
                                    <ChevronLeft className="w-5 h-5" />
                                  </button>
                                  <span className="text-text-main font-medium text-lg">
                                    {categoryPath[categoryPath.length - 1]?.name || selectedSubCat}
                                  </span>
                                </div>
                              )}

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {currentLevel.map((subCat, index) => {
                                  const isSelected = selectedSubCat === subCat.name
                                  return (
                                    <button
                                      key={`${subCat.name}-${index}`}
                                      onClick={() => handleSubCategoryClick(subCat)}
                                      className={`flex items-center justify-between px-6 py-3.5 rounded-full transition text-left cursor-pointer ${isSelected
                                        ? "bg-[#5b42f3] border-[#5b42f3] text-white"
                                        : "bg-bg-3 hover:bg-bg-4 border-transparent"
                                        } border`}
                                    >
                                      <span className="text-text-main text-sm md:text-base font-medium">{subCat.name}</span>
                                      {(subCat.subcategories || subCat.types) && (
                                        <ChevronRight className={`w-4 h-4 ${isSelected ? "text-white" : "text-[#8e8e93]"}`} />
                                      )}
                                    </button>
                                  )
                                })}
                              </div>
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })
          )}
        </div>

        <div className="flex flex-col-reverse md:flex-row justify-between gap-3 pt-8 mb-10">
          <button
            type="button"
            className="w-full md:w-auto px-14 md:px-20 py-4 rounded-full bg-bg-4 text-text-main hover:bg-[#5a5a5c] cursor-pointer transition-colors"
            onClick={handleCancelClick}
          >
            Odustani
          </button>
          <button
            type="button"
            className={`w-full md:w-auto px-14 md:px-20 py-4 rounded-full font-semibold transition-all duration-300 ${selectedSlug ? "bg-[#5b42f3] text-white hover:bg-[#4b35d6] cursor-pointer" : "bg-bg-2 text-gray-500 cursor-not-allowed"}`}
            onClick={() => {
              if (selectedSlug) {
                isRedirectingRef.current = true;
                sessionStorage.setItem("adFlow_restoreSlug", selectedSlug);
                router.push(getBaseUrl())
              }
            }}
          >
            Nastavi
          </button>
        </div>
      </div>
    </main>
  )
}