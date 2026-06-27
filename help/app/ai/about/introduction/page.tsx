import HelpLayout from "@/components/HelpLayout";

export default function AIIntroductionPage() {
  return (
    <HelpLayout pageTitle="Šta je Galset AI asistent?" hideWrapper={true}>
      <div className="space-y-8">
        <section className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            Galset AI je vaš lični pomoćnik za pretragu oglasa koji koristi veštačku inteligenciju da radi umesto vas. Umesto da se gubite sate listajući oglase i ručno podešavate filtere, asistent je tu da vam maksimalno olakša i ubrza proces pretrage.
          </p>
          <p>
            Zamislite ga kao stručnjaka koji poznaje svaki oglas na platformi. Vi mu jednostavno kažete šta tražite na primer: <span className="font-semibold">"nađi mi crni BMW do 15.000 evra u okolini Beograda"</span> i on će vam momentalno izbaciti najbolje rezultate koji odgovaraju vašem opisu.
          </p>

        </section>

        <section className="space-y-4 text-gray-700 dark:text-gray-300">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Ključne karakteristike</h3>
          <ul className="space-y-3 ml-4">
            <li className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 mt-2 bg-gray-400 rounded-full"></div>
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Razumevanje prirodnog jezika:</span> Možete da mu kažete šta tražite na način na koji biste to rekli prijatelju, bez potrebe za korišćenjem složenih filtera ili tehničkih termina.
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 mt-2 bg-gray-400 rounded-full"></div>
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Brza obrada upita:</span> AI analizira vaše potrebe i pronalazi relevantne oglase u realnom vremenu, štedeći vam dragoceno vreme.
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 mt-2 bg-gray-400 rounded-full"></div>
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Prilagodljivost i preciznost:</span> Može da razume i nejasne ili složene zahteve, kombinujući više kriterijuma da bi vam izbacio baš ono što tražite.
              </div>
            </li>
          </ul>
        </section>

        <section className="space-y-4 text-gray-700 dark:text-gray-300">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Primeri upotrebe</h3>
          <ul className="space-y-3 ml-4">
            <li className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 mt-2 bg-gray-400 rounded-full"></div>
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Automobili:</span> "Nađi mi crni BMW do 15.000 evra u okolini Beograda."
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 mt-2 bg-gray-400 rounded-full"></div>
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Tehnika:</span> "Koji telefon ima najbolju kameru u cenovnom rangu do 400 evra?"
              </div>
            </li>
            <li className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 mt-2 bg-gray-400 rounded-full"></div>
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">Logistika:</span> "Prikaži mi samo oglase gde prodavac nudi i isporuku."
              </div>
            </li>
          </ul>
        </section>

        <section className="space-y-4 text-gray-700 dark:text-gray-300">
          <p>
            Galset AI je osmišljen da transformiše način na koji pretražujete oglase, čineći proces bržim, lakšim i efikasnijim nego ikad ranije.
          </p>
        </section>
      </div>
    </HelpLayout>
  );
}
