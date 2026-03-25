"use client";
import { motion } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { toast } from "@/components/ui/sonner";
// تأكد من وجود الأقواس { getImageUrl } هنا
import { getImageUrl } from "@/lib/api"; 

const ProductCard = ({ product }) => {
  const { addToCart, setCart } = useCart();
  const router = useRouter();
  
  const productId = product._id || product.id;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <Link href={`/product/${productId}`} className="block">
        <div className="aspect-square overflow-hidden rounded-lg bg-secondary mb-3">
          <img
            src={getImageUrl(product.image)} // الآن ستعمل 100%
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
          />
        </div>
      </Link>
      
      <div className="flex items-start justify-between gap-2">
        <div>
          <Link href={`/product/${productId}`} className="hover:underline underline-offset-4">
            <h3 className="font-display text-base font-medium text-foreground">{product.name}</h3>
          </Link>
          <p className="text-sm text-muted-foreground mt-0.5">{product.price} €</p>
        </div>
        
        <div className="shrink-0 flex items-center gap-2">
          <button
            onClick={() => { 
              addToCart(product); 
              toast.success("Ajouté au panier"); 
            }}
            className="bg-primary text-primary-foreground p-2 rounded-md hover:opacity-90"
          >
            <ShoppingBag size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;