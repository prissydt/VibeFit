import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Loader2, Sparkles, Shirt, Footprints, ShoppingBag, Briefcase, Gem, Palette, Scissors, Type } from "lucide-react";
import { formatPrice, cn } from "@/lib/utils";
import type { OutfitLook, ItemHotspot, OutfitItem } from "@workspace/api-client-react/src/generated/api.schemas";
import { useGenerateModelImage } from "@workspace/api-client-react";

const CategoryIcon = ({ category, className }: { category: string, className?: string }) => {
  const cat = category.toLowerCase();
  if (cat.includes('top') || cat.includes('shirt') || cat.includes('jacket')) return <Shirt className={className} />;
  if (cat.includes('bottom') || cat.includes('pant') || cat.includes('skirt')) return <ShoppingBag className={className} />; 
  if (cat.includes('shoe') || cat.includes('foot') || cat.includes('boot')) return <Footprints className={className} />;
  if (cat.includes('bag') || cat.includes('purse')) return <Briefcase className={className} />;
  if (cat.includes('jewel') || cat.includes('accessor')) return <Gem className={className} />;
  if (cat.includes('makeup') || cat.includes('face') || cat.includes('lip')) return <Palette className={className} />;
  if (cat.includes('hair')) return <Scissors className={className} />;
  return <Type className={className} />;
};

interface ModelViewProps {
  look: OutfitLook;
  userSizes?: any;
  userProfile?: any;
}

export function ModelView({ look, userSizes, userProfile }: ModelViewProps) {
  const [modelImageB64, setModelImageB64] = useState<string | null>(look.modelImageB64 || null);
  const [hotspots, setHotspots] = useState<ItemHotspot[]>(look.hotspots || []);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
  
  const generateImageMutation = useGenerateModelImage();

  useEffect(() => {
    setActiveHotspot(null);
    if (!look.modelImageB64 && !modelImageB64) {
      generateImageMutation.mutate({
        data: {
          look,
          userSizes,
          userProfile,
        }
      }, {
        onSuccess: (res) => {
          setModelImageB64(res.modelImageB64);
          setHotspots(res.hotspots || []);
          // Also mutate the original look object to avoid re-fetching if we swipe back
          look.modelImageB64 = res.modelImageB64;
          look.hotspots = res.hotspots;
        }
      });
    } else {
      setModelImageB64(look.modelImageB64 || null);
      setHotspots(look.hotspots || []);
    }
  }, [look.id]);

  const isLoading = !modelImageB64 || generateImageMutation.isPending;

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black/20 rounded-2xl overflow-hidden" onClick={() => setActiveHotspot(null)}>
      {isLoading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-full border-t-2 border-primary border-r-2 border-r-transparent flex items-center justify-center relative z-10"
          >
            <Sparkles className="w-4 h-4 text-primary absolute" />
          </motion.div>
          <p className="text-sm text-muted-foreground animate-pulse relative z-10">Styling on model...</p>
        </div>
      ) : (
        <>
          <img 
            src={`data:image/png;base64,${modelImageB64}`} 
            alt="AI Generated Model" 
            className="w-full h-full object-cover"
          />
          
          {hotspots.map((spot, idx) => {
            const item = look.items[spot.itemIndex];
            if (!item) return null;
            const isActive = activeHotspot === idx;
            
            return (
              <div 
                key={idx}
                className="absolute"
                style={{ left: `${spot.xPct}%`, top: `${spot.yPct}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveHotspot(isActive ? null : idx);
                }}
              >
                <div className="relative -translate-x-1/2 -translate-y-1/2 cursor-pointer group">
                  <div className="absolute inset-0 rounded-full border-2 border-white/80 bg-white/20 animate-ping" />
                  <div className="w-6 h-6 rounded-full bg-primary/90 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20 transition-transform group-hover:scale-110">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className={cn(
                          "absolute z-20 w-64 p-4 rounded-xl glass-panel text-left cursor-default",
                          spot.xPct > 50 ? "right-full mr-4" : "left-full ml-4",
                          spot.yPct > 50 ? "bottom-0" : "top-0"
                        )}
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center flex-shrink-0">
                            <CategoryIcon category={item.category} className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] uppercase tracking-wider text-primary truncate mb-1">
                              {item.brand}
                            </p>
                            <h4 className="text-sm font-medium text-white truncate">{item.name}</h4>
                            <p className="text-xs text-white/60 mt-1">{formatPrice(item.price)}</p>
                          </div>
                        </div>
                        <a 
                          href={item.purchaseUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-4 w-full py-2 bg-primary text-primary-foreground rounded text-xs font-medium flex items-center justify-center gap-1 hover:bg-primary/90 transition-colors"
                        >
                          Shop Now <ExternalLink className="w-3 h-3" />
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
