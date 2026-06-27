import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Poruke - Galset",
};

export default function MessagesPage() {
  return (
    <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
      Izaberite razgovor
    </div>
  )
}
