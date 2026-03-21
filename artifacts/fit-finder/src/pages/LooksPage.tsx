import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { useLocation } from "wouter";
import { Layout } from "@/components/Layout";
import { ModelView } from "@/components/ModelView";
import { ItemRow } from "@/components/ItemRow";
import { lookStore } from "@/lib/lookStore";
import { useCart } from "@/context/CartContext";
import { useSaveOutfit } from "@workspace/api-client-react";
import { profileStore } from "@/lib/profileStore";
import { Button } from "@/components/ui/button";
import { Tags, Heart, X, Bookmark, BookmarkCheck } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function LooksPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const data = lookStore.get();
  
  const [activeLookIndex, setActiveLookIndex] = useState(0);
  const [swipedLooks, setSwipedLooks] = useState<Set<number>>(new Set());
  const [savedLooks, setSavedLooks] = useState<Set<string>>(new Set());

  const { addFullOutfit } = useCart();
  const saveMutation = useSaveOutfit();

  useEffect(() => {
    if (!data || !data.looks || data.looks.length === 0) {
      setLocation("/");
    }
  }, [data, setLocation]);

  if (!data || !data.looks || data.looks.length === 0) return null;

  const looks = data.looks;
  const isDone = activeLookIndex >= looks.length;

  const handleNext = () => {
    setActiveLookIndex(prev => prev + 1);
  };

  const saveLook = (look: any) => {
    if (savedLooks.has(look.id)) return;
    profileStore.likeLook(look.id);
    saveMutation.mutate({
      data: { prompt: data.prompt, look, userSizes: data.userSizes }
    });
    setSavedLooks(prev => new Set(prev).add(look.id));
  };

  const handleSaveOnly = (idx: number) => {
    const look = looks[idx];
    if (!look) return;
    if (savedLooks.has(look.id)) {
      toast({ title: "Already saved", description: "This look is in your wardrobe." });
      return;
    }
    saveLook(look);
    toast({ title: "Saved to your wardrobe", description: "Find it anytime under Saved." });
  };

  const handleLove = (idx: number) => {
    const look = looks[idx];
    if (!look) return;
    saveLook(look);
    addFullOutfit(look);
    toast({
      title: "Look saved! ❤️",
      description: "Items added to your cart.",
    });
    setSwipedLooks(prev => new Set(prev).add(idx));
    setTimeout(() => handleNext(), 300);
  };

  const handleSkip = (idx: number) => {
    setSwipedLooks(prev => new Set(prev).add(idx));
    setTimeout(() => handleNext(), 300);
  };

  if (isDone) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-lg mx-auto text-center space-y-8">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-4">
            <Heart className="w-16 h-16 text-primary mx-auto" />
            <h1 className="text-4xl font-serif">All Caught Up!</h1>
            <p className="text-muted-foreground">You've seen all the looks we curated for this prompt.</p>
          </motion.div>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button className="flex-1 h-12" onClick={() => setLocation("/")}>
              Generate More
            </Button>
            <Button variant="outline" className="flex-1 h-12" onClick={() => setLocation("/saved")}>
              <Bookmark className="w-4 h-4 mr-2" />
              View Saved
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex-1 flex flex-col lg:flex-row w-full h-[calc(100vh-5rem)] overflow-hidden">
        
        {/* Model Panel - Left/Top (Swipeable Stack) */}
        <div className="w-full lg:w-1/2 h-[60vh] lg:h-full relative bg-secondary overflow-hidden flex items-center justify-center">
          
          {/* Card Stack */}
          <div className="absolute inset-4 lg:inset-8 perspective-1000">
            <AnimatePresence>
              {looks.map((look, idx) => {
                if (idx < activeLookIndex) return null; // Already swiped
                if (idx > activeLookIndex + 1) return null; // Only render top 2
                
                return (
                  <SwipeableCard
                    key={look.id}
                    look={look}
                    userSizes={data.userSizes}
                    isTop={idx === activeLookIndex}
                    indexOffset={idx - activeLookIndex}
                    onSwipedRight={() => handleLove(idx)}
                    onSwipedLeft={() => handleSkip(idx)}
                  />
                );
              })}
            </AnimatePresence>
          </div>

          {/* Swipe Hints for Mobile */}
          <div className="absolute inset-x-0 top-4 flex justify-between px-6 pointer-events-none z-20">
            <span className="text-xs font-medium uppercase tracking-widest text-white/50">Look {activeLookIndex + 1} of {looks.length}</span>
          </div>

          {/* Bottom Action Controls */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6 z-20">
            <button
              onClick={() => handleSkip(activeLookIndex)}
              className="w-16 h-16 rounded-full bg-background/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors shadow-2xl group"
            >
              <X className="w-8 h-8 group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={() => handleLove(activeLookIndex)}
              className="w-16 h-16 rounded-full bg-background/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-green-500 hover:bg-green-500/10 transition-colors shadow-2xl group"
            >
              <Heart className="w-8 h-8 group-hover:scale-110 transition-transform fill-current" />
            </button>
          </div>
        </div>

        {/* Details Panel - Right/Bottom (Updates when activeLookIndex changes) */}
        <div className="w-full lg:w-1/2 h-full flex flex-col bg-background relative z-10 border-t lg:border-t-0 lg:border-l border-white/5">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeLookIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 space-y-8"
            >
              {looks[activeLookIndex] && (
                <>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium uppercase tracking-widest">
                        <Tags className="w-3 h-3" />
                        {looks[activeLookIndex].vibe}
                      </div>
                      <button
                        onClick={() => handleSaveOnly(activeLookIndex)}
                        title={savedLooks.has(looks[activeLookIndex].id) ? "Saved to wardrobe" : "Save for later"}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                          savedLooks.has(looks[activeLookIndex].id)
                            ? "bg-primary/10 border-primary/30 text-primary"
                            : "bg-white/5 border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20"
                        }`}
                      >
                        {savedLooks.has(looks[activeLookIndex].id) ? (
                          <><BookmarkCheck className="w-3.5 h-3.5" /> Saved</>
                        ) : (
                          <><Bookmark className="w-3.5 h-3.5" /> Save</>
                        )}
                      </button>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-serif text-foreground leading-tight">
                      {looks[activeLookIndex].title}
                    </h1>
                    <div className="text-3xl font-light text-primary">
                      {formatPrice(looks[activeLookIndex].totalCost)}
                    </div>
                  </div>

                  <div className="p-5 rounded-lg border border-white/5 bg-white/5 backdrop-blur-sm">
                    <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                      Stylist Notes
                    </h4>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      {looks[activeLookIndex].styleNotes}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-serif">Curated Pieces</h3>
                    <div className="space-y-2">
                      {looks[activeLookIndex].items.map((item, idx) => (
                        <ItemRow key={`${looks[activeLookIndex].id}-${idx}`} item={item} lookId={looks[activeLookIndex].id} lookTitle={looks[activeLookIndex].title} />
                      ))}
                    </div>
                  </div>
                  
                  <div className="h-12"></div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </Layout>
  );
}

// Separate component for the draggable card
function SwipeableCard({ 
  look, 
  userSizes, 
  isTop, 
  indexOffset, 
  onSwipedRight, 
  onSwipedLeft 
}: { 
  look: any, 
  userSizes: any, 
  isTop: boolean, 
  indexOffset: number,
  onSwipedRight: () => void,
  onSwipedLeft: () => void
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  // Overlay badges
  const loveOpacity = useTransform(x, [0, 100], [0, 1]);
  const skipOpacity = useTransform(x, [-100, 0], [1, 0]);

  const handleDragEnd = (e: any, info: any) => {
    const offset = info.offset.x;
    if (offset > 120) {
      onSwipedRight();
    } else if (offset < -120) {
      onSwipedLeft();
    }
  };

  const scale = 1 - indexOffset * 0.05;
  const yOffset = indexOffset * 20;

  return (
    <motion.div
      className="absolute inset-0 w-full h-full rounded-2xl bg-card border border-white/10 shadow-2xl overflow-hidden will-change-transform"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? opacity : 1,
        scale,
        y: yOffset,
        zIndex: 10 - indexOffset,
      }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={isTop ? { cursor: "grabbing" } : {}}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale, y: yOffset }}
      exit={{ x: x.get() > 0 ? 500 : -500, opacity: 0, rotate: x.get() > 0 ? 20 : -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="absolute inset-0 pointer-events-none z-30">
        <motion.div 
          style={{ opacity: loveOpacity }}
          className="absolute top-10 left-10 border-4 border-green-500 text-green-500 text-4xl font-bold px-4 py-2 rounded-xl rotate-[-15deg] uppercase tracking-widest bg-background/50 backdrop-blur-sm"
        >
          Love It ❤️
        </motion.div>
        <motion.div 
          style={{ opacity: skipOpacity }}
          className="absolute top-10 right-10 border-4 border-destructive text-destructive text-4xl font-bold px-4 py-2 rounded-xl rotate-[15deg] uppercase tracking-widest bg-background/50 backdrop-blur-sm"
        >
          Skip ✕
        </motion.div>
      </div>
      <ModelView look={look} userSizes={userSizes} />
    </motion.div>
  );
}
