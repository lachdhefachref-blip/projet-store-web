"use client";

import ProductDetails from "../../../src/screens/ProductDetails.jsx";

export default function ProductPage() {
  return <ProductDetails />;
}

"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, getImageUrl } from "@/lib/api";
import Image from "next/image";

export default function ProductPage() {
  const { id } = useParams(); 
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const data = await api(`/products/${id}`);
        setProduct(data);
      } catch (err) {
        console.error("Erreur chargement produit:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchProduct();
  }, [id]);

  if (loading) return <div className="p-20 text-center">Chargement...</div>;
  if (!product) {
    return (
      <div className="p-20 text-center">
        <h1 className="text-2xl font-bold">Produit introuvable</h1>
        <p>Le produit que vous recherchez n'existe pas ou a été supprimé.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="relative aspect-square">
        <Image 
          src={getImageUrl(product.image)} 
          alt={product.name} 
          fill 
          className="object-cover rounded-xl"
        />
      </div>
      <div>
        <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
        <p className="text-2xl text-primary mb-6">{product.price.toFixed(2)} €</p>
        <p className="text-muted-foreground">{product.description}</p>
        {}
      </div>
    </div>
  );
}