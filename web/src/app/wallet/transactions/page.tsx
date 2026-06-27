import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { wallets, transactions as walletTransactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  ArrowLeft,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  History,
} from "lucide-react";

export const dynamic = "force-dynamic";

async function getAllTransactions(userId: number) {
  const wallet = await db.query.wallets.findFirst({
    where: eq(wallets.userId, userId),
  });

  if (!wallet) {
    return { transactions: [] };
  }

  const transactions = await db.query.transactions.findMany({
    where: eq(walletTransactions.walletId, wallet.id),
    orderBy: [desc(walletTransactions.createdAt)],
  });

  return { transactions };
}

const months = ["januar", "februar", "mart", "april", "maj", "jun", "jul", "avgust", "septembar", "oktobar", "novembar", "decembar"];

function formatDate(date: Date) {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0 && now.getDate() === d.getDate()) {
    return `Danas, ${d.toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" })}`;
  } else if (diffDays === 1 || (diffDays === 0 && now.getDate() !== d.getDate())) {
    return `Juče, ${d.toLocaleTimeString("sr-RS", { hour: "2-digit", minute: "2-digit" })}`;
  } else {
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const showYear = year !== now.getFullYear();
    
    return `${day} ${month}${showYear ? ` ${year}` : ''}`;
  }
}

export default async function TransactionsPage() {
  const session = await auth();
  if (!session || !session.user?.id) {
    redirect("/auth/login");
  }

  const userId = parseInt(session.user.id);
  const { transactions } = await getAllTransactions(userId);

  return (
    <div className="min-h-screen bg-bg-1 text-text-main p-4 md:p-8 pt-8 md:pt-10">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-center gap-4">
          <div className="space-y-1 w-full text-center">
            <h1 className="text-text-main text-xl sm:text-2xl font-bold mt-4 mb-2 text-center">Istorija transakcija</h1>
          </div>
        </div>

        {/* TRANSACTIONS LIST */}
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="p-20 text-center space-y-4 bg-bg-2 border border-bg-3 rounded-3xl">
              <div className="w-20 h-20 bg-bg-3 rounded-full flex items-center justify-center mx-auto mb-4">
                <History size={32} className="text-gray-500" />
              </div>
              <h3 className="text-xl font-bold">Nema transakcija</h3>
              <p className="text-gray-500 max-w-xs mx-auto">
                Još uvek nemate nijednu transakciju u novčaniku.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {transactions.map((t) => {
                const isDeposit = t.type === "DEPOSIT" || t.type === "REFUND";
                return (
                  <div
                    key={t.id}
                    className="p-4 md:p-6 flex flex-row items-center justify-between gap-3 bg-bg-2 border border-bg-3 rounded-3xl hover:bg-bg-3/40 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center md:items-center gap-3 md:gap-4 flex-1 w-full min-w-0">
                      <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${
                        isDeposit ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      }`}>
                        {isDeposit ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                      </div>
                      <div className="flex flex-col flex-1 w-full min-w-0">
                        <p className="font-bold text-[15px] md:text-base leading-tight md:leading-normal">
                          {(t.description || (isDeposit ? "Dopuna kredita" : "Troškovi kredita"))
                            .replace(/^Kupovina promocija:\s*/i, "")
                            .replace(/^Objava oglasa sa:\s*/i, "")
                            .replace(/Promocija na vrhu undefined dana/g, "Promocija na vrhu (7 dana)")
                            .replace(/undefined dana/g, "(7 dana)")
                            .replace(/undefined/g, "(7 dana)")
                            .replace(" (30 dana)", "")}
                        </p>
                        
                        {/* Desktop mode */}
                        <p className="hidden md:block text-gray-400 text-sm mt-0.5">{formatDate(t.createdAt)}</p>
                        
                        {/* Mobile mode */}
                        <div className="flex items-center justify-between md:hidden w-full mt-1.5">
                          <p className={`font-black text-[13px] ${isDeposit ? "text-green-500" : "text-red-500"}`}>
                            {isDeposit ? "+" : "-"}{Math.abs(t.amount).toLocaleString("sr-RS")} kredita
                          </p>
                          <p className="text-gray-400 text-xs">{formatDate(t.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                    {/* Desktop credits */}
                    <div className="hidden md:block text-right shrink-0">
                      <p className={`font-black text-sm md:text-base ${isDeposit ? "text-green-500" : "text-red-500"}`}>
                        {isDeposit ? "+" : "-"}{Math.abs(t.amount).toLocaleString("sr-RS")} kredita
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
