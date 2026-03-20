import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSaveOutfit } from "@workspace/api-client-react";
import type { OutfitLook, UserSizes } from "@workspace/api-client-react/src/generated/api.schemas";
import { formatPrice } from "@/lib/utils";

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  look: OutfitLook;
  prompt: string;
}

export function OrderModal({ isOpen, onClose, look, prompt }: OrderModalProps) {
  const [sizes, setSizes] = useState<UserSizes>({
    top: "",
    bottom: "",
    shoes: "",
    dress: ""
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const saveMutation = useSaveOutfit();

  const handleSave = () => {
    saveMutation.mutate({
      data: {
        prompt,
        look,
        userSizes: sizes
      }
    }, {
      onSuccess: () => {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          onClose();
        }, 2000);
      }
    });
  };

  const handleSizeChange = (key: keyof UserSizes, value: string) => {
    setSizes(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col glass-panel rounded-xl"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 md:p-8 border-b border-border">
            <h2 className="text-2xl font-serif mb-2">Configure Your Fit</h2>
            <p className="text-sm text-muted-foreground">Select your sizes to save this look and quickly purchase items.</p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
            {/* Total Cost Highlight */}
            <div className="flex items-center justify-between p-6 rounded-lg bg-primary/10 border border-primary/20">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary mb-1">Total Look Value</p>
                <h3 className="text-3xl font-serif text-foreground">{formatPrice(look.totalCost)}</h3>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{look.items.length} items</p>
              </div>
            </div>

            {/* Size Configuration */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium uppercase tracking-widest text-foreground">Sizing Profile</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase">Top Size</label>
                  <select 
                    value={sizes.top}
                    onChange={(e) => handleSizeChange("top", e.target.value)}
                    className="w-full h-12 bg-input/50 border border-border rounded-sm px-4 text-sm focus:border-primary outline-none"
                  >
                    <option value="">Select Top Size</option>
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase">Bottom Size</label>
                  <select 
                    value={sizes.bottom}
                    onChange={(e) => handleSizeChange("bottom", e.target.value)}
                    className="w-full h-12 bg-input/50 border border-border rounded-sm px-4 text-sm focus:border-primary outline-none"
                  >
                    <option value="">Select Bottom Size</option>
                    {['28', '30', '32', '34', '36', '38', '40', 'XS', 'S', 'M', 'L', 'XL'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase">Shoe Size (US)</label>
                  <select 
                    value={sizes.shoes}
                    onChange={(e) => handleSizeChange("shoes", e.target.value)}
                    className="w-full h-12 bg-input/50 border border-border rounded-sm px-4 text-sm focus:border-primary outline-none"
                  >
                    <option value="">Select Shoe Size</option>
                    {['6', '7', '8', '9', '10', '11', '12', '13'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground uppercase">Dress Size (Optional)</label>
                  <select 
                    value={sizes.dress}
                    onChange={(e) => handleSizeChange("dress", e.target.value)}
                    className="w-full h-12 bg-input/50 border border-border rounded-sm px-4 text-sm focus:border-primary outline-none"
                  >
                    <option value="">Select Dress Size</option>
                    {['0', '2', '4', '6', '8', '10', '12', '14'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium uppercase tracking-widest text-foreground">Items in this Look</h4>
              <div className="space-y-2">
                {look.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm text-muted-foreground">{item.name} <span className="text-xs opacity-50">by {item.brand}</span></span>
                    <a 
                      href={item.purchaseUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1"
                    >
                      Shop <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-border bg-background/50">
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleSave}
              disabled={saveMutation.isPending || isSuccess}
            >
              {isSuccess ? (
                <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Saved to Wardrobe</span>
              ) : saveMutation.isPending ? (
                <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Saving...</span>
              ) : (
                "Save & Finalize Profile"
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
