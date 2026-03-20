import { createContext, useContext, useState, ReactNode } from "react";
import type { OutfitItem, OutfitLook } from "@workspace/api-client-react/src/generated/api.schemas";

export interface CartItem {
  id: string;
  lookId: string;
  lookTitle: string;
  item: OutfitItem;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (lookId: string, lookTitle: string, item: OutfitItem) => void;
  addFullOutfit: (look: OutfitLook) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;
  count: number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartState | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (lookId: string, lookTitle: string, item: OutfitItem) => {
    setItems(prev => {
      const id = `${lookId}-${item.category}-${item.name}`;
      const existing = prev.find(i => i.id === id);
      if (existing) {
        return prev.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { id, lookId, lookTitle, item, quantity: 1 }];
    });
    setIsOpen(true);
  };

  const addFullOutfit = (look: OutfitLook) => {
    setItems(prev => {
      let newItems = [...prev];
      look.items.forEach(item => {
        const id = `${look.id}-${item.category}-${item.name}`;
        const existing = newItems.find(i => i.id === id);
        if (existing) {
          newItems = newItems.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i);
        } else {
          newItems.push({ id, lookId: look.id, lookTitle: look.title, item, quantity: 1 });
        }
      });
      return newItems;
    });
    setIsOpen(true);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, i) => sum + (i.item.price * i.quantity), 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, addFullOutfit, removeItem, clearCart, total, count, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}
