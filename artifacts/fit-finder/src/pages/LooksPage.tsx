import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { ModelView } from "@/components/ModelView";
import { ItemRow } from "@/components/ItemRow";
import { lookStore } from "@/lib/lookStore";
import { useCart } from "@/context/CartContext";
import { useSaveOutfit } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Tags, ChevronLeft, ChevronRight, ShoppingBag, Bookmark, CheckCircle2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function LooksPage() {
  const [, setLocation] = useLocation();
  const [activeLookIndex, setActiveLookIndex] = useState(0);
  const data = lookStore.get();
  const { addFullOutfit } = useCart();
  const saveMutation = useSaveOutfit();
  const [savedLooks, setSavedLooks] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!data || !data.looks || data.looks.length === 0) {
      setLocation("/");
    }
  }, [data, setLocation]);

  if (!data || !data.looks || data.looks.length === 0) return null;

  const looks = data.looks;
  const activeLook = looks[activeLookIndex];

  const handleNext = () => setActiveLookIndex(prev => Math.min(looks.length - 1, prev + 1));
  const handlePrev = () => setActiveLookIndex(prev => Math.max(0, prev - 1));

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = offset.x;
    if (swipe < -50) handleNext();
    else if (swipe > 50) handlePrev();
  };

  const handleSave = () => {
    if (savedLooks.has(activeLook.id)) return;
    
    saveMutation.mutate({
      data: {
        prompt: data.prompt,
        look: activeLook,
        userSizes: data.userSizes
      }
    }, {
      onSuccess: () => {
        setSavedLooks(prev => new Set(prev).add(activeLook.id));
      }
    });
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col lg:flex-row w-full h-[calc(100vh-5rem)] overflow-hidden">
        
        {/* Model Panel - Left/Top */}
        <motion.div 
          className="w-full lg:w-1/2 h-[60vh] lg:h-full relative bg-secondary"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeLookIndex}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-4 lg:inset-8"
            >
              <ModelView look={activeLook} userSizes={data.userSizes} />
            </motion.div>
          </AnimatePresence>

          {/* Swipe Hints for Mobile */}
          <div className="absolute inset-y-0 left-0 w-12 flex items-center justify-start pl-2 lg:hidden pointer-events-none opacity-50">
            {activeLookIndex > 0 && <ChevronLeft className="w-6 h-6 text-white drop-shadow-lg" />}
          </div>
          <div className="absolute inset-y-0 right-0 w-12 flex items-center justify-end pr-2 lg:hidden pointer-events-none opacity-50">
            {activeLookIndex < looks.length - 1 && <ChevronRight className="w-6 h-6 text-white drop-shadow-lg" />}
          </div>
        </motion.div>

        {/* Details Panel - Right/Bottom */}
        <div className="w-full lg:w-1/2 h-full flex flex-col bg-background relative z-10 border-t lg:border-t-0 lg:border-l border-white/5">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 space-y-8">
            
            {/* Nav & Meta */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Look {activeLookIndex + 1} of {looks.length}
              </span>
              <div className="flex items-center gap-2">
                {looks.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveLookIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === activeLookIndex 
                        ? "bg-primary w-6" 
                        : "bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>

            <motion.div 
              key={`title-${activeLookIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium uppercase tracking-widest">
                <Tags className="w-3 h-3" />
                {activeLook.vibe}
              </div>
              <h1 className="text-4xl lg:text-5xl font-serif text-foreground leading-tight">
                {activeLook.title}
              </h1>
              <div className="text-3xl font-light text-primary">
                {formatPrice(activeLook.totalCost)}
              </div>
            </motion.div>

            <motion.div 
              key={`notes-${activeLookIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="p-5 rounded-lg border border-white/5 bg-white/5 backdrop-blur-sm"
            >
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                Stylist Notes
              </h4>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {activeLook.styleNotes}
              </p>
            </motion.div>

            <div className="space-y-4">
              <h3 className="text-lg font-serif">Curated Pieces</h3>
              <div className="space-y-2">
                {activeLook.items.map((item, idx) => (
                  <ItemRow key={`${activeLook.id}-${idx}`} item={item} lookId={activeLook.id} lookTitle={activeLook.title} />
                ))}
              </div>
            </div>
            
            {/* Extra space for bottom bar */}
            <div className="h-24"></div>
          </div>

          {/* Bottom Action Bar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-6 bg-background/80 backdrop-blur-xl border-t border-white/5 flex gap-4">
            <Button 
              className="flex-1 h-14 text-sm"
              onClick={() => addFullOutfit(activeLook)}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Add Full Look to Cart
            </Button>
            <Button 
              variant="outline"
              className="flex-1 h-14 text-sm"
              onClick={handleSave}
              disabled={savedLooks.has(activeLook.id) || saveMutation.isPending}
            >
              {savedLooks.has(activeLook.id) ? (
                <><CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> Saved</>
              ) : (
                <><Bookmark className="w-4 h-4 mr-2" /> Save Look</>
              )}
            </Button>
          </div>
        </div>

      </div>
    </Layout>
  );
}
