"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Search,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRightLeft,
  Bot,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProductCard, ProductCardData } from "@/components/ui/ProductCard";
import { formatCurrency } from "@/lib/utils";

const samplePrompts = [
  "I need a laptop under ₹60,000 for programming and light multitasking",
  "Recommend headphones for online meetings and airplane flights",
  "Best smartwatch with GPS and long battery under ₹40,000",
  "Vlogging camera with 4K recording under ₹70,000",
  "Flagship smartphone with great battery life under ₹75,000",
];

function AssistantContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [prompt, setPrompt] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const executeAdvisor = async (queryText: string) => {
    if (!queryText.trim()) return;
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/ai/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: queryText }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data);
      } else {
        alert(data.error || "Advisor service temporarily unavailable");
      }
    } catch {
      alert("Error contacting shopping advisor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      executeAdvisor(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      executeAdvisor(prompt.trim());
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
      {/* Title & Trust Banner */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-blue-600" />
          <span>Zero Hallucinations Guarantee</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
          AI Product Shopping Advisor
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-500 leading-relaxed">
          Ask questions in natural language. The advisor extracts your budget, extracts hardware specs,
          and validates recommendations against authentic database inventory.
        </p>
      </div>

      {/* Main Search Input Form */}
      <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto mb-6">
        <div className="relative flex items-center rounded-2xl border border-zinc-300 bg-white p-2 shadow-elevated focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 transition">
          <Bot className="ml-3 h-5 w-5 text-blue-600 shrink-0" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you are looking for (budget, specs, use-case)..."
            className="w-full bg-transparent px-3.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
          />
          <Button
            type="submit"
            disabled={loading || !prompt.trim()}
            isLoading={loading}
            className="rounded-xl px-5 font-semibold shrink-0"
          >
            Ask Advisor
          </Button>
        </div>

        {/* Sample prompt chips */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-zinc-400 font-medium">Try asking:</span>
          {samplePrompts.map((sp, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setPrompt(sp);
                executeAdvisor(sp);
              }}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-zinc-600 hover:border-blue-400 hover:text-blue-600 transition"
            >
              {sp}
            </button>
          ))}
        </div>
      </form>

      {/* Results Section */}
      {loading && (
        <div className="my-12 rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm max-w-3xl mx-auto">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mx-auto animate-spin">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-zinc-900">
            Querying Live Catalog & Extracting Requirements...
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            Verifying budget constraints, cross-referencing specs, and ranking verified stock.
          </p>
        </div>
      )}

      {response && !loading && (
        <div className="space-y-8 mt-10">
          {/* Interpreted Constraints Banner */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-2.5 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-blue-600" />
              Interpreted Query Constraints & Catalog Signals
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl bg-white p-2.5 border border-blue-100">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Budget Cap</span>
                <span className="font-bold text-zinc-900 mt-0.5 block">
                  {response.interpretedQuery?.budgetLimit
                    ? formatCurrency(response.interpretedQuery.budgetLimit)
                    : "Flexible Budget"}
                </span>
              </div>

              <div className="rounded-xl bg-white p-2.5 border border-blue-100">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Category</span>
                <span className="font-bold text-zinc-900 mt-0.5 block capitalize">
                  {response.interpretedQuery?.targetCategory?.replace("-", " ") || "All Tech"}
                </span>
              </div>

              <div className="rounded-xl bg-white p-2.5 border border-blue-100">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Key Specs</span>
                <span className="font-bold text-zinc-900 mt-0.5 block truncate">
                  {response.interpretedQuery?.keywords?.slice(0, 3).join(", ") || "General Match"}
                </span>
              </div>

              <div className="rounded-xl bg-white p-2.5 border border-blue-100">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Eligible Results</span>
                <span className="font-bold text-emerald-600 mt-0.5 block">
                  {response.products?.length} Verified Products
                </span>
              </div>
            </div>
          </div>

          {/* AI Explanation Box */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0 mt-0.5">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Advisor Recommendation & Explanation</h3>
                <div className="mt-2 text-xs sm:text-sm text-zinc-700 leading-relaxed whitespace-pre-line font-normal">
                  {response.explanation}
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Products Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-zinc-900">
                Eligible Products Ranked by Fit
              </h3>
              {response.products?.length >= 2 && (
                <Link
                  href={`/compare?p1=${response.products[0].id}&p2=${response.products[1].id}`}
                  className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5" />
                  Compare Top 2 Options
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {response.products?.map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-12 text-center text-sm">Loading AI Advisor...</div>}>
      <AssistantContent />
    </Suspense>
  );
}
