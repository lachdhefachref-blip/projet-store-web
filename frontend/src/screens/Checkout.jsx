"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { toast } from "sonner"; 
import { useRouter } from "next/navigation";

/**
 * Fonction pour extraire les détails précis de l'erreur 400 (Bad Request)
 * envoyée par le backend (ex: téléphone manquant ou format invalide)
 */
function getDetailedError(err) {
  if (err.details) {
    if (err.details.shipping) {
      const fields = Object.keys(err.details.shipping);
      // Retourne les champs manquants : "Champs requis: phone, city..."
      return `Champs requis ou invalides : ${fields.join(", ")}`;
    }
    if (err.details.items) return "Problème avec les produits dans le panier";
  }
  return err.message || "Une erreur est survenue";
}

const Checkout = () => {
  const { isAuthenticated } = useAuth();
  const { cart, totalPrice, clearCart } = useCart();
  const router = useRouter();

  // État local pour gérer les champs du formulaire de livraison
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });

  const [loading, setLoading] = useState(false);

  /**
   * Validation côté client avant d'activer le bouton de validation
   */
  const canSubmit = useMemo(() => {
    return (
      isAuthenticated &&
      cart.length > 0 &&
      form.firstName.trim() !== "" &&
      form.lastName.trim() !== "" &&
      form.phone.trim().length >= 8 && // Vérification de la longueur du téléphone
      form.address.trim() !== "" &&
      form.city.trim() !== "" &&
      form.postalCode.trim() !== ""
    );
  }, [cart, form, isAuthenticated]);

  /**
   * Fonction principale pour créer la commande sur le serveur
   */
  const createOrder = async () => {
    setLoading(true);
    try {
      const res = await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          // Envoi des IDs des produits et quantités
          items: cart.map((it) => ({ 
            productId: it.id || it._id, 
            quantity: it.quantity 
          })),
          // Envoi des informations de livraison nettoyées
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

      // Si succès : vider le panier et rediriger vers "Mes commandes"
      clearCart();
      toast.success("Commande enregistrée avec succès ! 🎉");
      router.push("/orders");
      return res.order;

    } catch (err) {
      console.error("Order Error Details:", err);
      
      // Affichage du message d'erreur détaillé (ex: 400 Bad Request)
      const msg = getDetailedError(err);
      toast.error("Échec de la commande", { description: msg });
      
      // Gestion spécifique de l'expiration du Token (401)
      if (err.status === 401) {
        toast.error("Session expirée, veuillez vous reconnecter");
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl min-h-[60vh]">
      <h1 className="text-3xl font-bold mb-4">Finaliser la commande</h1>
      <p className="text-muted-foreground mb-8 text-lg">
        Total à payer : <span className="font-bold text-foreground">{totalPrice.toFixed(2)} €</span>
      </p>

      {!isAuthenticated ? (
        <div className="p-6 border rounded-lg bg-yellow-50 text-yellow-700">
          Veuillez vous connecter pour continuer.
        </div>
      ) : cart.length === 0 ? (
        <div className="p-6 border rounded-lg bg-blue-50 text-blue-700">
          Votre panier est vide.
        </div>
      ) : (
        <div className="space-y-4 bg-white p-6 rounded-lg border shadow-sm">
          {/* Section Nom & Prénom */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Nom</label>
              <input
                placeholder="Votre nom"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-black outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Prénom</label>
              <input
                placeholder="Votre prénom"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-black outline-none"
              />
            </div>
          </div>

          {/* Téléphone */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Téléphone</label>
            <input
              placeholder="Ex: +216 22 123 456"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          {/* Adresse */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Adresse complète</label>
            <input
              placeholder="Numéro, rue, quartier..."
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-black outline-none"
            />
          </div>

          {/* Ville & Code Postal */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Ville</label>
              <input
                placeholder="Ville"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-black outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Code postal</label>
              <input
                placeholder="Ex: 1000"
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-black outline-none"
              />
            </div>
          </div>

          {/* Bouton de validation */}
          <button
            disabled={!canSubmit || loading}
            onClick={createOrder}
            className="w-full bg-black text-white py-4 rounded-md font-bold hover:bg-gray-800 disabled:bg-gray-300 transition-all mt-6"
          >
            {loading ? "Traitement en cours..." : "Valider et Payer à la livraison"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Checkout;