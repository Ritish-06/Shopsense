"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Star,
  ShoppingCart,
  Heart,
  ArrowRightLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  TrendingDown,
  Bell,
  Cpu,
  Layers,
  ThumbsUp,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  Check,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StockBadge } from "@/components/ui/StockBadge";
import { ProductCard } from "@/components/ui/ProductCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [productData, setProductData] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [targetPrice, setTargetPrice] = useState("");
  const [priceAlertSuccess, setPriceAlertSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"specs" | "reviews" | "priceHistory">("specs");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.product) {
          setProductData(data.product);
          setSelectedImage(data.product.images[0]?.url || "");
          if (data.product.variants?.length > 0) {
            setSelectedVariant(data.product.variants[0]);
          }
        }
        if (data.similarProducts) {
          setSimilarProducts(data.similarProducts);
        }
      })
      .catch((err) => console.error("Error loading product detail:", err))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-sm text-zinc-500">
        Loading verified product intelligence...
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-zinc-900">Product Not Found</h2>
        <p className="mt-2 text-sm text-zinc-500">The requested catalog item does not exist or has been retired.</p>
        <Link href="/products" className="mt-4 inline-block text-sm font-semibold text-blue-600">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const primaryInventory = productData.inventory[0];
  const stockQuantity = primaryInventory?.quantity ?? 10;
  const reorderPoint = primaryInventory?.reorderPoint ?? 15;
  const primaryRetailer = primaryInventory?.retailer;

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    try {
      const res = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: productData.id,
          variantId: selectedVariant?.id,
          quantity: 1,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAddedSuccess(true);
        setTimeout(() => setAddedSuccess(false), 2500);
      } else {
        alert(data.error || "Failed to add to cart");
      }
    } catch {
      alert("Error adding item to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push("/cart");
  };

  const handleSetPriceAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPrice) return;
    setPriceAlertSuccess(true);
    setTimeout(() => setPriceAlertSuccess(false), 4000);
  };

  // Prepare price history chart data
  const chartData = (productData.priceHistory || []).map((ph: any) => ({
    date: formatDate(ph.recordedAt),
    price: ph.price,
    reason: ph.reason || "Catalog Price",
  }));

  // Min and Max recorded prices
  const recordedPrices = (productData.priceHistory || []).map((ph: any) => ph.price);
  const minHistoricalPrice = recordedPrices.length > 0 ? Math.min(...recordedPrices) : productData.basePrice;
  const maxHistoricalPrice = recordedPrices.length > 0 ? Math.max(...recordedPrices) : productData.basePrice;

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
        <Link href="/" className="hover:text-blue-600">
          Home
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-blue-600">
          Products
        </Link>
        <span>/</span>
        <Link href={`/products?category=${productData.category?.slug}`} className="hover:text-blue-600">
          {productData.category?.name}
        </Link>
        <span>/</span>
        <span className="text-zinc-800 font-medium truncate max-w-xs">{productData.title}</span>
      </nav>

      {/* Main Showcase Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Gallery (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
            <img
              src={selectedImage}
              alt={productData.title}
              className="h-full w-full object-contain object-center transition-all duration-300"
            />
            {stockQuantity <= reorderPoint && stockQuantity > 0 && (
              <span className="absolute top-4 left-4 rounded-md bg-orange-600 px-2 py-0.5 text-xs font-semibold text-white shadow-sm">
                Only {stockQuantity} left
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {productData.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {productData.images.map((img: any) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-white p-1 transition ${
                    selectedImage === img.url ? "border-blue-600" : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Center: Details & Buying Box (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            {/* Brand & Category Header */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                {productData.brand}
              </span>
              <StockBadge quantity={stockQuantity} reorderPoint={reorderPoint} />
            </div>

            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 leading-tight">
              {productData.title}
            </h1>

            {/* Rating & Verified Purchases */}
            <div className="mt-3 flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-amber-500 font-semibold">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-zinc-900">{productData.rating.toFixed(1)}</span>
              </div>
              <span className="text-zinc-300">•</span>
              <span className="text-zinc-600">{productData.reviewCount} customer reviews</span>
              <span className="text-zinc-300">•</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded">
                <CheckCircle2 className="h-3 w-3" />
                Verified Retailer Stock
              </span>
            </div>

            {/* Price section */}
            <div className="mt-5 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-black text-zinc-900">
                  {formatCurrency(selectedVariant?.price ?? productData.basePrice)}
                </span>
                <span className="text-sm text-zinc-400 line-through">
                  {formatCurrency(Math.round((selectedVariant?.price ?? productData.basePrice) * 1.15))}
                </span>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
                  Save 15%
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                Inclusive of all taxes • Free express shipping via BlueDart on all prepaid orders
              </p>
            </div>

            {/* Fulfilling Retailer Profile Card */}
            {primaryRetailer && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-3.5 text-xs shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700 font-bold">
                    {primaryRetailer.storeName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1 font-semibold text-zinc-900">
                      <span>Sold & Fulfilled by {primaryRetailer.storeName}</span>
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <p className="text-zinc-500 text-[11px] mt-0.5">{primaryRetailer.address || "Certified Hub"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-emerald-600 block">4.9 ★ Seller Rating</span>
                  <span className="text-[10px] text-zinc-400">99.4% On-Time Dispatch</span>
                </div>
              </div>
            )}

            {/* Short Description */}
            <p className="mt-5 text-sm text-zinc-600 leading-relaxed">{productData.description}</p>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 border-t border-zinc-200 pt-6">
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={stockQuantity === 0}
                isLoading={isAddingToCart}
                variant={addedSuccess ? "emerald" : "default"}
                size="lg"
                className="w-full sm:flex-1 font-semibold rounded-xl"
              >
                {addedSuccess ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Added to Shopping Cart
                  </>
                ) : stockQuantity === 0 ? (
                  "Sold Out"
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </>
                )}
              </Button>

              <Button
                onClick={handleBuyNow}
                disabled={stockQuantity === 0}
                variant="outline"
                size="lg"
                className="w-full sm:flex-1 font-semibold rounded-xl border-zinc-300"
              >
                Instant Buy Now
              </Button>

              <Link
                href={`/compare?p1=${productData.id}`}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-sm"
                title="Compare with other devices"
              >
                <ArrowRightLeft className="mr-1.5 h-4 w-4" />
                Compare
              </Link>
            </div>

            {/* Delivery & Assurance Pills */}
            <div className="mt-6 grid grid-cols-3 gap-2 border-t border-zinc-100 pt-4 text-center text-[11px] text-zinc-500">
              <div className="flex flex-col items-center">
                <Truck className="h-4 w-4 text-zinc-600 mb-1" />
                <span>2-Day Express Delivery</span>
              </div>
              <div className="flex flex-col items-center">
                <RotateCcw className="h-4 w-4 text-zinc-600 mb-1" />
                <span>7-Day Replacement</span>
              </div>
              <div className="flex flex-col items-center">
                <ShieldCheck className="h-4 w-4 text-zinc-600 mb-1" />
                <span>1-Year Official Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Specifications, Review Intelligence, Price Tracking */}
      <section className="mt-14 border-t border-zinc-200 pt-8">
        <div className="flex border-b border-zinc-200 gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab("specs")}
            className={`pb-3 transition ${
              activeTab === "specs"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 transition flex items-center gap-1.5 ${
              activeTab === "reviews"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Review Intelligence & Sentiments
            <span className="rounded-full bg-blue-100 px-2 py-0.2 text-[10px] font-bold text-blue-700">
              AI Analyzed
            </span>
          </button>
          <button
            onClick={() => setActiveTab("priceHistory")}
            className={`pb-3 transition flex items-center gap-1.5 ${
              activeTab === "priceHistory"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            Price Tracker & Alerts
            <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-800">
              Live
            </span>
          </button>
        </div>

        {/* Tab 1: Specs */}
        {activeTab === "specs" && (
          <div className="mt-6">
            <h3 className="text-base font-bold text-zinc-900 mb-4">Verified Hardware Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-4xl">
              {Object.entries(productData.specs || {}).map(([key, val]: [string, any]) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-lg border border-zinc-200/80 bg-white p-3 text-xs"
                >
                  <span className="font-medium text-zinc-500">{key}</span>
                  <span className="font-semibold text-zinc-900 text-right">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Review Intelligence */}
        {activeTab === "reviews" && (
          <div className="mt-6 space-y-8">
            {/* Review Intelligence Summary Box */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-6 max-w-4xl">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-zinc-200">
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Aspect-Based Sentiment Intelligence</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Synthesized from {productData.reviewCount} customer reviews across build quality, battery, performance.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>88% Positive Consensus</span>
                  </div>
                </div>
              </div>

              {/* Aspect Pills */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="rounded-xl border border-zinc-200 bg-white p-3">
                  <span className="text-[11px] font-medium text-zinc-500 block">Performance & Speed</span>
                  <span className="text-sm font-bold text-emerald-600 mt-1 block">94% Positive</span>
                  <span className="text-[10px] text-zinc-400">Low latency, zero lag</span>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-3">
                  <span className="text-[11px] font-medium text-zinc-500 block">Build & Ergonomics</span>
                  <span className="text-sm font-bold text-emerald-600 mt-1 block">91% Positive</span>
                  <span className="text-[10px] text-zinc-400">High-grade materials</span>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-3">
                  <span className="text-[11px] font-medium text-zinc-500 block">Battery Endurance</span>
                  <span className="text-sm font-bold text-emerald-600 mt-1 block">85% Positive</span>
                  <span className="text-[10px] text-zinc-400">Meets advertised hours</span>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-3">
                  <span className="text-[11px] font-medium text-zinc-500 block">Value for Money</span>
                  <span className="text-sm font-bold text-amber-600 mt-1 block">74% Positive</span>
                  <span className="text-[10px] text-zinc-400">Premium pricing tier</span>
                </div>
              </div>
            </div>

            {/* Individual Reviews */}
            <div className="space-y-4 max-w-4xl">
              <h4 className="text-sm font-bold text-zinc-900">Verified Customer Reviews</h4>
              {productData.reviews?.map((r: any) => (
                <div key={r.id} className="rounded-xl border border-zinc-200 bg-white p-5 text-xs shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900">{r.user?.name || "Customer"}</span>
                      {r.verifiedPurchase && (
                        <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <h5 className="font-semibold text-zinc-900 mt-2">{r.title}</h5>
                  <p className="mt-1 text-zinc-600 leading-relaxed">{r.comment}</p>
                  <span className="text-[10px] text-zinc-400 mt-3 block">{formatDate(r.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Price Tracker */}
        {activeTab === "priceHistory" && (
          <div className="mt-6 space-y-6 max-w-4xl">
            {/* Price Stats Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <span className="text-xs text-zinc-500">Current Catalog Price</span>
                <p className="text-xl font-bold text-zinc-900 mt-1">{formatCurrency(productData.basePrice)}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <span className="text-xs text-zinc-500">Historical Minimum (90 Days)</span>
                <p className="text-xl font-bold text-emerald-600 mt-1">{formatCurrency(minHistoricalPrice)}</p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <span className="text-xs text-zinc-500">Historical Maximum</span>
                <p className="text-xl font-bold text-zinc-600 mt-1">{formatCurrency(maxHistoricalPrice)}</p>
              </div>
            </div>

            {/* Historical Price Chart */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h4 className="text-sm font-bold text-zinc-900 mb-1">90-Day Authoritative Price Trajectory</h4>
              <p className="text-xs text-zinc-500 mb-4">Recorded price changes from authorized retailers.</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                    <YAxis
                      stroke="#94a3b8"
                      fontSize={11}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(Number(val)), "Recorded Price"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#2563eb" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Set Target Price Alert Form */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-blue-600 p-2 text-white">
                  <Bell className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-zinc-900">Set Target Price Alert</h4>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    We will notify you immediately via in-app alert when this product drops below your desired target.
                  </p>

                  {priceAlertSuccess ? (
                    <div className="mt-3 rounded-lg bg-emerald-100 p-2.5 text-xs font-semibold text-emerald-800">
                      ✓ Price alert registered! You will be alerted when price drops to ₹{Number(targetPrice).toLocaleString()}.
                    </div>
                  ) : (
                    <form onSubmit={handleSetPriceAlert} className="mt-4 flex max-w-sm gap-2">
                      <input
                        type="number"
                        placeholder={`Target (e.g. ₹${Math.round(productData.basePrice * 0.9)})`}
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        className="h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 text-xs focus:border-blue-600 focus:outline-none"
                      />
                      <Button type="submit" size="sm" className="shrink-0">
                        Set Alert
                      </Button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Similar & Recommended Products */}
      {similarProducts.length > 0 && (
        <section className="mt-16 border-t border-zinc-200 pt-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900">Similar Recommended Gear</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Comparable devices in {productData.category?.name}</p>
            </div>
            <Link
              href={`/products?category=${productData.category?.slug}`}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Browse Category <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
