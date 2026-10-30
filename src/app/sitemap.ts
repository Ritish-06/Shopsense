import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://shopsense.ai";

  const routes = [
    "",
    "/products",
    "/assistant",
    "/compare",
    "/price-tracker",
    "/cart",
    "/retailer",
    "/retailer/inventory",
    "/retailer/inventory/forecast",
    "/retailer/sales",
    "/retailer/assistant",
    "/admin",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" || route === "/products" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/products" ? 0.9 : 0.8,
  }));
}
