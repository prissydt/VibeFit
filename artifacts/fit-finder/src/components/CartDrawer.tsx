import { useCart } from "@/context/CartContext";
import { X, ExternalLink, ShoppingBag, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, clearCart, total } = useCart();

  // Group items by look
  const groupedItems = items.reduce((acc, cartItem) => {
    if (!acc[cartItem.lookTitle]) acc[cartItem.lookTitle] = [];
    acc[cartItem.lookTitle].push(cartItem);
    return acc;
  }, {} as Record<string, typeof items>);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-card/90 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-serif">Shopping Cart</h2>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <ShoppingBag className="w-12 h-12 mb-2" />
                  <p className="text-sm">Your cart is empty.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {Object.entries(groupedItems).map(([lookTitle, lookItems]) => (
                    <div key={lookTitle} className="space-y-4">
                      <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground border-b border-white/5 pb-2">
                        {lookTitle}
                      </h3>
                      <div className="space-y-3">
                        {lookItems.map((cartItem) => (
                          <div key={cartItem.id} className="flex gap-4 p-3 rounded-lg bg-white/5 border border-white/5">
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2 mb-1">
                                <p className="text-[10px] uppercase tracking-wider text-primary truncate">
                                  {cartItem.item.brand}
                                </p>
                                <button 
                                  onClick={() => removeItem(cartItem.id)}
                                  className="text-muted-foreground hover:text-destructive transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <h4 className="text-sm font-medium truncate mb-1">{cartItem.item.name}</h4>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-sm font-light">{formatPrice(cartItem.item.price)}</span>
                                <a 
                                  href={cartItem.item.purchaseUrl} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-xs flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                                >
                                  Buy <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-white/5 bg-background/50 space-y-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-serif">Total</span>
                  <span className="font-light">{formatPrice(total)}</span>
                </div>
                
                <p className="text-[10px] text-muted-foreground text-center">
                  Items are purchased directly from each retailer's website.
                </p>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={clearCart}>
                    Clear Cart
                  </Button>
                  <Button className="flex-1" onClick={() => {
                    items.forEach(i => window.open(i.item.purchaseUrl, '_blank'));
                  }}>
                    Buy All ({items.length})
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
