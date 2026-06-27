export interface HelpArticle {
  title: string;
  category: string;
  path: string;
  index: number;
  responseKeys?: string[];
  keywords?: string[];
}

export const HELP_INDEX: HelpArticle[] = [
  // Galset AI
  { title: "Šta je Galset AI asistent?", category: "O Galset AI", path: "/ai/about", index: 0 },
  { title: "Kako započeti razgovor?", category: "O Galset AI", path: "/ai/about", index: 1 },
  { title: "Ograničenja AI modela?", category: "O Galset AI", path: "/ai/about", index: 2 },
  { title: "Greška u AI razgovoru", category: "O Galset AI", path: "/ai/about", index: 3 },
  { title: "Kako koristiti pretragu oglasa sa AI?", category: "Pretraga oglasa sa AI", path: "/ai/search", index: 0 },
  { title: "Greška prilikom pretrage", category: "Pretraga oglasa sa AI", path: "/ai/search", index: 1 },
  { title: "AI daje pogrešne odgovore", category: "Pretraga oglasa sa AI", path: "/ai/search", index: 2 },
  { title: "Kako videti svoju istoriju razgovora?", category: "Istorija razgovora sa AI", path: "/ai/history", index: 0 },
  { title: "Kako obrisati istoriju razgovora?", category: "Istorija razgovora sa AI", path: "/ai/history", index: 1 },
  { title: "Kako nastaviti razgovor sa AI?", category: "Istorija razgovora sa AI", path: "/ai/history", index: 2 },
  { title: "Privatnost podataka sa AI", category: "Istorija razgovora sa AI", path: "/ai/history", index: 3 },

  // Oglasi
  { title: "Kako postaviti oglas?", category: "Postavljanje oglasa", path: "/ads/posting", index: 0 },
  { title: "Pisanje naslova i opisa oglasa", category: "Postavljanje oglasa", path: "/ads/posting", index: 1 },
  { title: "Određivanje cene oglasa", category: "Postavljanje oglasa", path: "/ads/posting", index: 2 },
  { title: "Dodavanje filtera oglasa", category: "Postavljanje oglasa", path: "/ads/posting", index: 3 },
  { title: "Linkovi u oglasu", category: "Postavljanje oglasa", path: "/ads/posting", index: 4 },
  { title: "Kontakt podaci oglasa", category: "Postavljanje oglasa", path: "/ads/posting", index: 5 },
  { title: "Šta je zabranjeno oglašavati?", category: "Postavljanje oglasa", path: "/ads/posting", index: 6 },
  { title: "Provera i odobravanje oglasa", category: "Postavljanje oglasa", path: "/ads/posting", index: 7 },
  { title: "Trajanje oglasa, cena i limiti", category: "Postavljanje oglasa", path: "/ads/posting", index: 8 },
  { title: "Greška prilikom objavljivanja oglasa", category: "Postavljanje oglasa", path: "/ads/posting", index: 9 },

  { title: "Kako upravljati mojim oglasima?", category: "Upravljanje oglasima", path: "/ads/manage", index: 0 },
  { title: "Kako izmeniti oglas?", category: "Upravljanje oglasima", path: "/ads/manage", index: 1 },
  { title: "Kako obnoviti oglas?", category: "Upravljanje oglasima", path: "/ads/manage", index: 2 },
  { title: "Kako obrisati oglas?", category: "Upravljanje oglasima", path: "/ads/manage", index: 3 },
  { title: "Kako deaktivirati oglas?", category: "Upravljanje oglasima", path: "/ads/manage", index: 4 },
  { title: "Kako aktivirati oglas?", category: "Upravljanje oglasima", path: "/ads/manage", index: 5 },
  { title: "Kako označiti oglas kao prodat?", category: "Upravljanje oglasima", path: "/ads/manage", index: 6 },
  { title: "Gde se nalaze moji istekli oglasi?", category: "Upravljanje oglasima", path: "/ads/manage", index: 7 },

  { title: "Šta su promocije i zašto ih koristiti?", category: "Vidljivost i promocije", path: "/ads/promotions", index: 0 },
  { title: "Vrste Galset promocija", category: "Vidljivost i promocije", path: "/ads/promotions", index: 1 },
  { title: "Kako aktivirati promociju?", category: "Vidljivost i promocije", path: "/ads/promotions", index: 2 },
  { title: "Trajanje i obnova promocija", category: "Vidljivost i promocije", path: "/ads/promotions", index: 3 },
  { title: "Kombinovanje više promocija", category: "Vidljivost i promocije", path: "/ads/promotions", index: 4 },
  { title: "Praćenje rezultata promocije", category: "Vidljivost i promocije", path: "/ads/promotions", index: 5 },

  { title: "Šta je lista želja?", category: "Lista želja", path: "/ads/wishlist", index: 0 },
  { title: "Kako videti moju listu želja?", category: "Lista želja", path: "/ads/wishlist", index: 1 },
  { title: "Kako dodati oglas u listu želja?", category: "Lista želja", path: "/ads/wishlist", index: 2 },
  { title: "Kako ukloniti oglas iz liste želja?", category: "Lista želja", path: "/ads/wishlist", index: 3 },

  { title: "Šta vidim u statistici oglasa?", category: "Statistika oglasa", path: "/ads/stats", index: 0 },
  { title: "Kako da vidim statistiku oglasa?", category: "Statistika oglasa", path: "/ads/stats", index: 1 },
  { title: "Kako videti ukupan broj pregleda?", category: "Statistika oglasa", path: "/ads/stats", index: 2 },
  { title: "Kako videti broj sačuvanih oglasa?", category: "Statistika oglasa", path: "/ads/stats", index: 3 },
  { title: "Kako videti broj poruka?", category: "Statistika oglasa", path: "/ads/stats", index: 4 },

  // Pretraga
  { title: "Kako pretraživati oglase?", category: "Pretraga oglasa", path: "/search/ads", index: 0 },
  { title: "Kako koristiti filtere?", category: "Pretraga oglasa", path: "/search/ads", index: 1 },
  { title: "Sortiranje rezultata pretrage", category: "Pretraga oglasa", path: "/search/ads", index: 2 },
  { title: "Pretraga po lokaciji", category: "Pretraga oglasa", path: "/search/ads", index: 3 },

  { title: "Kako pretraživati korisnike?", category: "Pretraga korisnika", path: "/search/users", index: 0 },
  { title: "Šta vidim na profilu korisnika?", category: "Pretraga korisnika", path: "/search/users", index: 1 },

  { title: "Kako pregledati istoriju pretrage oglasa?", category: "Istorija pretrage oglasa", path: "/search/ads-history", index: 0 },
  { title: "Brisanje oglasa iz istorije pretrage", category: "Istorija pretrage oglasa", path: "/search/ads-history", index: 1 },

  { title: "Kako pregledati istoriju pretrage korisnika?", category: "Istorija pretrage korisnika", path: "/search/users-history", index: 0 },
  { title: "Brisanje istorije pretrage korisnika", category: "Istorija pretrage korisnika", path: "/search/users-history", index: 1 },

  // Plaćanje
  { title: "Cenovnik usluga", category: "Cenovnik", path: "https://galset.com/pricing", index: 0 },
  { title: "Galset krediti", category: "Galset krediti", path: "https://galset.com/policies/credits", index: 0 },
  { title: "Pregled transakcija", category: "Transakcije", path: "/billing/transactions", index: 0 },

  // Komunikacija
  { title: "Kako pregledati poruke?", category: "Poruke", path: "/communication/messages", index: 0 },
  { title: "Kako poslati poruku?", category: "Poruke", path: "/communication/messages", index: 1 },
  { title: "Kako oceniti korisnika?", category: "Ocene", path: "/communication/reviews", index: 0 },
  { title: "Kako pregledati ocene?", category: "Ocene", path: "/communication/reviews", index: 1 },
  { title: "Uslovi za ocenjivanje", category: "Ocene", path: "/communication/reviews", index: 2 },
  { title: "Kako zapratiti korisnika?", category: "Praćenje korisnika", path: "/communication/follow", index: 0 },
  { title: "Kako otpratiti korisnika?", category: "Praćenje korisnika", path: "/communication/follow", index: 1 },
  { title: "Lista pratilaca", category: "Praćenje korisnika", path: "/communication/follow", index: 2 },

  // Moj Nalog
  { title: "Kako napraviti nalog?", category: "Prijava i registracija", path: "/account/get-started", index: 0 },
  { title: "Kako se prijaviti?", category: "Prijava i registracija", path: "/account/get-started", index: 1 },
  { title: "Kako se odjaviti?", category: "Prijava i registracija", path: "/account/get-started", index: 2 },

  { title: "Izmena profilne slike", category: "Izmena profila", path: "/account/edit", index: 0 },
  { title: "Izmena imena", category: "Izmena profila", path: "/account/edit", index: 1 },
  { title: "Izmena korisničkog imena", category: "Izmena profila", path: "/account/edit", index: 2 },
  { title: "Izmena države", category: "Izmena profila", path: "/account/edit", index: 3 },
  { title: "Izmena grada", category: "Izmena profila", path: "/account/edit", index: 4 },
  { title: "Izmena adrese", category: "Izmena profila", path: "/account/edit", index: 5 },
  { title: "Izmena opisa profila", category: "Izmena profila", path: "/account/edit", index: 6 },

  { title: "Izmena email adrese", category: "Lični podaci", path: "/account/personal", index: 0 },
  { title: "Kako izmeniti rođendan?", category: "Lični podaci", path: "/account/personal", index: 1 },
  { title: "Izmena broja telefona", category: "Lični podaci", path: "/account/personal", index: 2 },

  { title: "Isključivanje obaveštenja", category: "Obaveštenja", path: "/account/notifications", index: 0 },
  { title: "Uključivanje obaveštenja", category: "Obaveštenja", path: "/account/notifications", index: 1 },
  { title: "Ne primam obaveštenja", category: "Obaveštenja", path: "/account/notifications", index: 2 },

  { title: "Promena lozinke", category: "Lozinka i bezbednost", path: "/account/security", index: 0 },
  { title: "Odjava sa svih uređaja", category: "Lozinka i bezbednost", path: "/account/security", index: 1 },
  { title: "Odjava određenog uređaja", category: "Lozinka i bezbednost", path: "/account/security", index: 2 },

  { title: "Podešavanja kolačića", category: "Privatnost", path: "/account/privacy", index: 0 },
  { title: "Kako deaktivirati nalog?", category: "Privatnost", path: "/account/privacy", index: 1 },
  { title: "Kako obrisati nalog?", category: "Privatnost", path: "/account/privacy", index: 2 },

  { title: "Kako promeniti jezik?", category: "Podešavanja", path: "/account/settings", index: 0 },
  { title: "Kako promeniti temu?", category: "Podešavanja", path: "/account/settings", index: 1 },
  { title: "Kako promeniti izgled oglasa?", category: "Podešavanja", path: "/account/settings", index: 2 },

  // Bezbednost
  { title: "Kako prijaviti korisnika?", category: "Prijavite nešto", path: "/safety/report", index: 0 },
  { title: "Kako prijaviti oglas?", category: "Prijavite nešto", path: "/safety/report", index: 1 },
  { title: "Prijavljivanje tehničkog problema", category: "Prijavite nešto", path: "/safety/report", index: 2 },
  { title: "Kako blokirati korisnika?", category: "Blokiranje korisnika", path: "/safety/block", index: 0 },
  { title: "Kako odblokirati korisnika?", category: "Blokiranje korisnika", path: "/safety/block", index: 1 },
  { title: "Lista blokiranih korisnika", category: "Blokiranje korisnika", path: "/safety/block", index: 2 },
  { title: "Šta se desi kad blokiram korisnika?", category: "Blokiranje korisnika", path: "/safety/block", index: 3 }
];
