"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api, getImageUrl } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { toast } from "@/components/ui/sonner"; // الإصلاح هنا

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", id],
    enabled: !!id,
    queryFn: async () => {
      const res = await api(`/products/${id}`);
      return res.product || res;
    }
  });

  if (isLoading) return <div className="p-10 text-center text-muted-foreground">Chargement...</div>;
  if (isError || !product) return <div className="p-10 text-center text-destructive">Produit introuvable</div>;

  return (
    <div className="container mx-auto p-4 md:py-12">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="rounded-xl overflow-hidden bg-secondary border border-border">
          <img 
            src={getImageUrl(product.image)} 
            alt={product.name} 
            className="w-full h-auto object-cover max-h-[500px]"
          />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-foreground">{product.name}</h1>
          <div className="mt-4 flex items-center gap-4">
            <span className="text-2xl font-semibold text-primary">{product.price} €</span>
            {product.category && (
              <span className="px-2 py-1 bg-secondary text-xs rounded-full">{product.category}</span>
            )}
          </div>
          <p className="mt-6 text-muted-foreground leading-relaxed">
            {product.description || "Aucune description disponible."}
          </p>
          <button 
            onClick={() => { 
              addToCart(product); 
              toast.success("Produit ajouté au panier !"); 
            }}
            className="mt-8 bg-primary text-primary-foreground hover:opacity-90 px-8 py-4 rounded-lg font-medium transition-all w-fit"
          >
            Ajouter au Panier
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;