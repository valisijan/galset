"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Check, Gift } from "lucide-react"
function PricingSkeleton() {
    return (
        <div className="min-h-screen bg-bg-1 text-text-main p-6 md:p-12 font-sans animate-pulse">
            <div className="max-w-3xl mx-auto">
                {/* Header Skeleton */}
                <div className="text-center mb-14 flex flex-col items-center">
                    <div className="h-10 bg-bg-2 rounded-full w-48 mb-4" />
                    <div className="h-4 bg-bg-2 rounded-full w-36" />
                </div>

                {/* Description Skeleton */}
                <div className="space-y-3 mb-14">
                    <div className="h-4 bg-bg-2 rounded-full w-full" />
                    <div className="h-4 bg-bg-2 rounded-full w-[95%]" />
                    <div className="h-4 bg-bg-2 rounded-full w-[90%]" />
                    <div className="h-4 bg-bg-2 rounded-full w-[40%] mt-6" />
                    <div className="h-4 bg-bg-2 rounded-full w-[95%] mt-2" />
                    <div className="h-4 bg-bg-2 rounded-full w-[85%] mt-2" />
                </div>

                {/* Plans Skeleton */}
                <div className="mb-16">
                    <div className="h-7 bg-bg-2 rounded-full w-48 mx-auto mb-4" />
                    <div className="h-4 bg-bg-2 rounded-full w-full mb-8" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="bg-bg-2 rounded-3xl border border-bg-3 p-6 flex flex-col h-48 space-y-4">
                                <div className="h-6 bg-bg-3 rounded-full w-1/2" />
                                <div className="h-8 bg-bg-3 rounded-full w-1/3" />
                                <div className="space-y-2 mt-auto">
                                    <div className="h-4 bg-bg-3 rounded-full w-full" />
                                    <div className="h-4 bg-bg-3 rounded-full w-[80%]" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Credits Skeleton */}
                <div className="mb-16">
                    <div className="h-7 bg-bg-2 rounded-full w-48 mx-auto mb-3" />
                    <div className="h-4 bg-bg-2 rounded-full w-full mb-6" />
                    <div className="bg-bg-2 rounded-3xl border border-bg-3 overflow-hidden h-64 flex flex-col justify-between p-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex justify-between items-center py-2 border-b border-bg-3 last:border-0">
                                <div className="h-5 bg-bg-3 rounded-full w-24" />
                                <div className="h-5 bg-bg-3 rounded-full w-20" />
                                <div className="h-5 bg-bg-3 rounded-full w-16" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function PricingPage() {
    const [pricingData, setPricingData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/pricing`)
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setPricingData(data.pricing)
                }
                setLoading(false)
            })
            .catch((err) => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    if (loading) {
        return <PricingSkeleton />
    }

    // Map Krediti pricing
    const dbCreditTiers = pricingData
        .filter((item) => item.category === 'krediti')
        .map((item) => {
            const min = item.features?.minPrice
            const max = item.features?.maxPrice
            const pct = item.features?.bonusPercentage
            const credits = item.features?.credits

            let range = ""
            let bonus = ""
            let creditsText = ""

            if (item.name === 'Minimalna uplata') {
                range = `${min}€`
                bonus = `${credits} kredita`
                creditsText = "Osnovni paket"
            } else {
                range = max ? `${min}€ – ${max}€` : `${min}€+`
                bonus = pct > 0 ? `+${pct}% bonus` : "Bez bonusa"
                const bonusCreditsVal = pct > 0 ? min * pct : 0
                creditsText = `+${bonusCreditsVal.toLocaleString("de-DE")} kredita`
            }

            return {
                range,
                bonus,
                credits: creditsText,
                highlight: min >= 100
            }
        })

    // Map General features (Opšte usluge) - ONLY Obnova, Dodatni oglas, Dodatne slike
    const dbGeneralFeatures = pricingData
        .filter((item) => item.category === 'promocija' && !item.features?.durationDays && (item.name.includes("Obnova") || item.name.includes("postavljanje oglasa") || item.name.includes("postavljanje slika")))
        .map((item) => {
            let note = ""
            if (item.name.includes("Obnova")) note = "vratite oglas na vrh liste"
            else if (item.name.includes("postavljanje oglasa")) note = "cena po dodatnom oglasu"
            else if (item.name.includes("postavljanje slika")) note = "cena po dodatnoj slici"

            return {
                name: item.name,
                credits: item.price,
                note
            }
        })

    // Map Dodaci features (Dodaci oglasa) - Videos first, Hitno značka last
    const dbDodaciFeatures = pricingData
        .filter((item) => item.category === 'promocija' && !item.features?.durationDays && (item.name.includes("značka") || item.name.includes("Video")))
        .map((item) => {
            let note = ""
            if (item.name.includes("značka")) note = "istaknite hitnost prodaje"
            else if (item.name.includes("15 sekunde")) note = "dodajte kratak video"
            else if (item.name.includes("30 sekunde")) note = "dodajte srednji video"
            else if (item.name.includes("60 sekunde")) note = "dodajte dugačak video"

            return {
                name: item.name,
                credits: item.price,
                note,
                isVideo: item.name.includes("Video")
            }
        })
        .sort((a, b) => {
            // Videos first, Hitno značka last
            if (a.isVideo && !b.isVideo) return -1;
            if (!a.isVideo && b.isVideo) return 1;
            return 0;
        })

    // Map Publish features
    const dbPublishFeatures = pricingData
        .filter((item) => item.category === 'promocija' && item.name.includes("Objava oglasa"))
        .map((item) => {
            const days = item.features?.durationDays
            let note = "produženo trajanje"
            if (days === 30) note = "osnovno trajanje, besplatno"
            else if (days === 100) note = "maksimalno trajanje"

            return {
                name: item.name,
                credits: item.price,
                note
            }
        })

    // Map Promotion tiers (7, 15, 30 days)
    const durations = [7, 15, 30]
    const dbPromotionTiers = durations.map((d) => {
        const featuresForDuration = pricingData
            .filter((item) => item.category === 'promocija' && item.features?.durationDays === d && !item.name.includes("Objava"))
            .map((item) => {
                let note = ""
                let name = item.name.split(" (")[0]
                if (name.includes("Istaknuti")) note = "Oglas dobija pozadinu plave boje"
                else if (name.includes("Prioritetni")) note = "Oglas se svaka 3 dana vraca na vrh liste"
                else if (name.includes("Na vrhu")) note = "Oglas je na vrhu liste u drugom redu"
                else if (name.includes("Premium")) note = "Oglas je na vrhu liste u prvom redu i dobija pozadinu zlatne boje"

                return {
                    name,
                    credits: item.price,
                    note
                }
            })

        return {
            duration: `${d} dana`,
            features: featuresForDuration
        }
    })

    // Map Plans
    const dbPlans = pricingData
        .filter((item) => item.category === 'plan')
        .map((item) => {
            return {
                name: item.name,
                price: item.price === 0 ? "Besplatno" : `${item.price}€ mesecno`,
                adsLimit: item.features?.adsLimit,
                imagesLimit: item.features?.imagesLimit,
                discount: item.features?.discountPercentage,
                highlight: item.name === 'Ultra'
            }
        })

    return (
        <div className="min-h-screen bg-bg-1 text-text-main p-6 md:p-12 font-sans leading-relaxed transition-colors duration-300">
            <div className="max-w-3xl mx-auto">

                <div className="text-center mb-14">
                    <h1 className="text-4xl font-bold mb-4">Cenovnik</h1>
                    <p className="text-center opacity-80 mb-10">Poslednja izmena: Maj 17, 2026</p>
                </div>

                <p className="mb-6 text-left">
                    Dobrodošli na zvanični cenovnik Galset platforme. Naš cilj je da vam pružimo maksimalnu vidljivost i najbrži put do kupaca uz potpuno transparentne troškove. Naša ponuda je kreirana tako da bude fer: plaćate isključivo za vrhunske alate koji direktno povećavaju vaše šanse za prodaju.
                </p>

                <p className="mb-14 text-left">
                    Sve transakcije su sigurne, bez skrivenih troškova i procesuirane kroz svetski priznate sisteme, kako biste se vi mogli fokusirati na ono najbitnije – uspešnu trgovinu.
                </p>
                {dbPlans.length > 0 && (
                    <section id="planovi" className="mb-16">
                        <h2 className="text-2xl font-bold mb-4 text-center">Planovi pretplate</h2>
                        <p className="mb-8 text-left">
                            Izaberite plan koji najbolje odgovara vašim potrebama prodaje. Veći planovi donose više mogućnosti i veće popuste na promocije.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {dbPlans.map((plan) => (
                                <div key={plan.name} className="bg-bg-2 rounded-3xl border border-bg-3 p-6 flex flex-col justify-between min-h-[300px]">
                                    <div>
                                        <div className="mb-4">
                                            <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                                            <p className="text-2xl font-semibold text-[#6366f1]">{plan.price}</p>
                                        </div>
                                        <ul className="space-y-3 mb-6">
                                            <li className="flex items-center gap-2 text-sm">
                                                <Check className="w-4 h-4 text-[#6366f1] shrink-0" />
                                                <span><strong>{plan.adsLimit}</strong> aktivnih oglasa</span>
                                            </li>
                                            <li className="flex items-center gap-2 text-sm">
                                                <Check className="w-4 h-4 text-[#6366f1] shrink-0" />
                                                <span><strong>{plan.imagesLimit}</strong> slika po oglasu</span>
                                            </li>
                                            <li className="flex items-center gap-2 text-sm">
                                                <Check className="w-4 h-4 text-[#6366f1] shrink-0" />
                                                <span>Popust na promocije: <strong>{plan.discount}%</strong></span>
                                            </li>
                                        </ul>
                                    </div>
                                    <button className={`w-full py-3 mt-auto rounded-full font-bold text-center transition-colors text-sm cursor-pointer ${plan.name === 'Free' ? 'bg-bg-4 text-gray-300 hover:bg-[#5a5a5c]' : 'bg-[#5b42f3] text-white hover:bg-[#4b35d6]'}`}>
                                        Započnite
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {dbCreditTiers.length > 0 && (
                    <section className="mb-16">
                        <h2 className="text-2xl font-bold mb-3 text-center">Galset krediti</h2>
                        <p className="mb-6 text-left">
                            Galset krediti su interna digitalna valuta naše platforme koja vam omogućava da aktivirate napredne promotivne alate. Minimalna uplata iznosi 5€ (500 kredita).
                        </p>

                        <div className="bg-bg-2 rounded-3xl border border-bg-3 overflow-hidden">
                            <div className="grid grid-cols-3 px-4 md:px-8 py-4 border-b border-bg-3 text-[10px] md:text-xs font-bold text-gray-400 tracking-widest bg-bg-3/30">
                                <span>Iznos dopune</span>
                                <span className="text-center">Bonus</span>
                                <span className="text-right">Bonus krediti</span>
                            </div>
                            {dbCreditTiers.map((tier, i) => (
                                <div
                                    key={i}
                                    className="grid grid-cols-3 px-4 md:px-8 py-5 items-center border-b border-bg-3 last:border-0 transition-colors hover:bg-bg-3/10"
                                >
                                    <div className="flex items-center">
                                        <span className="font-bold text-sm md:text-base text-text-main">{tier.range}</span>
                                    </div>
                                    <span className={`text-xs md:text-sm font-bold text-center ${tier.highlight ? 'text-[#6366f1]' : 'text-gray-300'}`}>
                                        {tier.bonus}
                                    </span>
                                    <span className="text-xs md:text-sm font-medium text-gray-400 text-right">{tier.credits}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-center mt-6">
                            <Link
                                href="/wallet"
                                className="bg-[#5b42f3] text-white font-bold px-8 py-3 rounded-full hover:bg-[#4b35d6] transition-colors flex items-center gap-2"
                            >
                                Dopuni kredite
                            </Link>
                        </div>
                    </section>
                )}

                {dbGeneralFeatures.length > 0 && (
                    <section className="mb-16">
                        <h2 className="text-2xl font-bold mb-4 text-center">Opšte usluge</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            {dbGeneralFeatures.map((feat) => (
                                <div
                                    key={feat.name}
                                    className="bg-bg-2 rounded-3xl border border-bg-3 p-5 flex flex-row items-center justify-between gap-4 md:flex-col md:items-start md:justify-between hover:border-[#6366f1]/40 transition-colors min-h-[90px] md:min-h-[120px]"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-text-main text-sm break-words">{feat.name}</p>
                                        <p className="text-xs text-gray-400 mt-0.5 break-words">{feat.note}</p>
                                    </div>
                                    <div className="shrink-0 text-right md:text-left md:mt-4">
                                        <span className="font-bold text-lg text-[#6366f1]">{feat.credits.toLocaleString("de-DE")}</span>
                                        <span className="text-[#6366f1] text-xs ml-1">kredita</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {dbPublishFeatures.length > 0 && (
                            <>
                                <h2 className="text-xl font-bold mb-4 text-center mt-12">Objava oglasa</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                    {dbPublishFeatures.map((feat) => (
                                        <div
                                            key={feat.name}
                                            className="bg-bg-2 rounded-3xl border border-bg-3 p-5 flex flex-row items-center justify-between gap-4 md:flex-col md:items-start md:justify-between hover:border-[#6366f1]/40 transition-colors min-h-[90px] md:min-h-[120px]"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-text-main text-sm break-words">{feat.name}</p>
                                                <p className="text-xs text-gray-400 mt-0.5 break-words">{feat.note}</p>
                                            </div>
                                            <div className="shrink-0 text-right md:text-left md:mt-4">
                                                <span className="font-bold text-lg text-[#6366f1]">
                                                    {feat.credits === 0 ? "Besplatno" : feat.credits.toLocaleString("de-DE")}
                                                </span>
                                                {feat.credits > 0 && <span className="text-[#6366f1] text-xs ml-1">kredita</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </section>
                )}

                {dbDodaciFeatures.length > 0 && (
                    <section className="mb-16">
                        <h2 className="text-2xl font-bold mb-4 text-center">Dodaci oglasa</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {dbDodaciFeatures.map((feat) => {
                                const isVideo = feat.name.includes("Video");
                                const nameParts = feat.name.includes(" (") && !isVideo ? feat.name.split(" (") : [feat.name];
                                const title = nameParts[0];
                                const sub = nameParts[1] ? `(${nameParts[1]}` : null;
                                return (
                                    <div
                                        key={feat.name}
                                        className="bg-bg-2 rounded-3xl border border-bg-3 p-5 flex flex-row items-center justify-between gap-4 sm:flex-col sm:items-start sm:justify-between hover:border-[#6366f1]/40 transition-colors min-h-[90px] sm:min-h-[120px]"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-semibold text-sm break-words ${isVideo ? 'text-white' : 'text-text-main'}`}>
                                                {title}
                                                {sub && <span className="block font-normal text-xs text-gray-400 mt-0.5">{sub}</span>}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5 break-words">{feat.note}</p>
                                        </div>
                                        <div className="shrink-0 text-right sm:text-left sm:mt-4">
                                            <span className="font-bold text-lg text-[#6366f1]">{feat.credits.toLocaleString("de-DE")}</span>
                                            <span className="text-[#6366f1] text-xs ml-1">kredita</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {dbPromotionTiers.some(t => t.features.length > 0) && (
                    <section className="mb-16">
                        <h2 className="text-2xl font-bold mb-4 text-center">Promocije oglasa</h2>
                        <p className="mb-8 text-left">
                            Podignite svoj oglas u centar pažnje! Naš sistem promocija vam omogućava da precizno birate gde i kako želite da se vaš sadržaj istakne zavisno od broja dana.
                        </p>

                        <div className="space-y-8">
                            {dbPromotionTiers.map((tier) => (
                                <div key={tier.duration}>
                                    <h3 className="text-lg font-bold mb-4">{tier.duration}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {tier.features.map((feat) => (
                                            <div
                                                key={feat.name}
                                                className="bg-bg-2 rounded-3xl border border-bg-3 p-5 flex flex-row items-center justify-between gap-4 hover:border-[#6366f1]/40 transition-colors min-h-[90px]"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-text-main text-sm break-words">{feat.name}</p>
                                                    <p className="text-xs text-gray-400 mt-0.5 break-words">{feat.note}</p>
                                                </div>
                                                <div className="shrink-0 text-right">
                                                    <span className="font-bold text-lg text-[#6366f1]">{feat.credits.toLocaleString("de-DE")}</span>
                                                    <span className="text-[#6366f1] text-xs ml-1">kredita</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}            </div>
        </div>
    )
}
