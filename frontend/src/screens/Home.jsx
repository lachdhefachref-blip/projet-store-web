"use client";
import ProductCard from "@/components/ProductCard";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import Image from "next/image";
import heroBanner from "@/assets/hero-banner.jpg";

const Home = () => {
  const [activeCategory, setActiveCategory] = useState("Tout");
  const [query, setQuery] = useState("");

  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ["products", query, activeCategory],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.set("search", query);
      if (activeCategory !== "Tout") params.set("category", activeCategory);
      
      const res = await api(`/products?${params.toString()}`);
      // الباك-اند يرسل { products: [...] }
      return res.products || []; 
    },
    retry: 1
  });

  const categories = useMemo(() => {
    return ["Tout", "Ordinateurs", "Smartphones & Tablettes", "Audio", "Photo & Vidéo", "Accessoires", "Bureau"];
  }, []);

  return (
    <div className="min-h-screen">
       {/* Hero Section تبقى كما هي */}
       <section className="container mx-auto px-4 py-12">
          <div className="mb-6">
            <input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher..." 
              className="w-full max-w-md p-2 border rounded-md"
            />
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map(cat => (
              <button 
                key={cat} 
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm ${activeCategory === cat ? 'bg-primary text-white' : 'bg-secondary'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              <p>Chargement...</p>
            ) : isError ? (
              <p className="text-destructive">Erreur API (Port 5000 check)</p>
            ) : (
              products.map(p => <ProductCard key={p._id} product={p} />)
            )}
          </div>
       </section>
    </div>
  );
};
export default Home;