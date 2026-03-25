"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { toast } from "sonner"; 
import { useRouter } from "next/navigation";

const Checkout = () => {
  const { isAuthenticated } = useAuth();
  const { cart, totalPrice, clearCart } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "", address: "", city: "", postalCode: ""
  });

  const canSubmit = useMemo(() => {
    return isAuthenticated && cart.length > 0 && 
      Object.values(form).every(v => v.trim().length > 0) &&
      form.phone.trim().length >= 5; 
  }, [cart, form, isAuthenticated]);

  const createOrder = async () => {
    setLoading(true);
    try {
      const res = await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          items: cart.map((it) => ({ 
            productId: it._id || it.id, 
            quantity: it.quantity 
          })),
          shipping: {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            phone: form.phone.trim(),
            address: form.address.trim(),
            city: form.city.trim(),
            postalCode: form.postalCode.trim(),
          },
        }),
      });

      clearCart();
      toast.success("Commande validée ! 🎉");
      router.push("/orders");
    } catch (err) {

      const detail = err.details ? Object.keys(err.details).join(", ") : "";
      toast.error("Erreur commande", { 
        description: detail ? `Champs invalides: ${detail}` : err.message 
      });
      if (err.status === 401) router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Finaliser la commande</h1>
      <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
        {}
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="Nom" className="p-3 border rounded" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
          <input placeholder="Prénom" className="p-3 border rounded" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
        </div>
        <input placeholder="Téléphone (+216...)" className="w-full p-3 border rounded" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
        <input placeholder="Adresse" className="w-full p-3 border rounded" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
        <div className="grid grid-cols-2 gap-4">
          <input placeholder="Ville" className="p-3 border rounded" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
          <input placeholder="Code Postal" className="p-3 border rounded" value={form.postalCode} onChange={e => setForm({...form, postalCode: e.target.value})} />
        </div>
        
        <button 
          disabled={!canSubmit || loading} 
          onClick={createOrder}
          className="w-full bg-black text-white py-4 rounded font-bold disabled:bg-gray-300"
        >
          {loading ? "Chargement..." : `Payer ${totalPrice.toFixed(2)} € à la livraison`}
        </button>
      </div>
    </div>
  );
};

export default Checkout;