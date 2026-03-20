import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGenerateOutfits } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronLeft, ChevronRight, Tags } from "lucide-react";
import { ItemRow } from "@/components/ItemRow";
import { formatPrice } from "@/lib/utils";
import type { OutfitLook } from "@workspace/api-client-react/src/generated/api.schemas";
import { OrderModal } from "@/components/OrderModal";

// Pre-defined prompts for inspiration
const SUGGESTIONS = [
  "A moody, dark academia winter look for a coffee shop date",
  "Sleek minimalist evening wear for a gallery opening",
  "Edgy streetwear with metallic accents for a concert",
  "Quiet luxury weekend getaway in Aspen"
];

function LoadingState() {
  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 space-y-12">
      <div className="text-center space-y-4">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 mx-auto rounded-full border-t-2 border-primary border-r-2 border-r-transparent flex items-center justify-center"
        >
          <Sparkles className="w-4 h-4 text-primary absolute" />
        </motion.div>
        <h2 className="text-2xl font-serif text-foreground">Curating Your Wardrobe...</h2>
        <p className="text-sm text-muted-foreground animate-pulse">Our AI stylists are pulling pieces from global collections.</p>
      </div>

      <div className="glass-panel p-8 rounded-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        <div className="space-y-8 opacity-50">
          <div className="h-8 w-1/3 bg-white/10 rounded-sm" />
          <div className="grid gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-white/10 rounded-md flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/4 bg-white/10 rounded-sm" />
                  <div className="h-3 w-1/2 bg-white/5 rounded-sm" />
                </div>
                <div className="w-16 h-8 bg-white/10 rounded-sm flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [activeLookIndex, setActiveLookIndex] = useState(0);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  
  const generateMutation = useGenerateOutfits();

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setActiveLookIndex(0);
    generateMutation.mutate({
      data: { prompt, numLooks: 3 }
    });
  };

  const handleSuggestion = (text: string) => {
    setPrompt(text);
  };

  const looks = generateMutation.data?.looks || [];
  const activeLook = looks[activeLookIndex];

  return (
    <Layout>
      <AnimatePresence mode="wait">
        {!generateMutation.isPending && looks.length === 0 && (
          <motion.div 
            key="search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-3xl mx-auto"
          >
            <div className="text-center mb-12 space-y-4">
              <h1 className="text-5xl md:text-7xl font-serif text-gradient">
                Define Your Aesthetic.
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                Describe the exact vibe, occasion, or specific piece you want to style. Our AI will curate complete, shoppable looks instantly.
              </p>
            </div>

            <div className="w-full relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/5 to-primary/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              <div className="relative flex flex-col gap-4">
                <Textarea 
                  placeholder="e.g., 'A chic, monochromatic outfit for a gallery opening in Paris featuring a statement trench coat...'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="text-lg py-4 min-h-[160px] bg-background/80 backdrop-blur-md border-white/10 focus-visible:border-primary/50 focus-visible:ring-primary/20 shadow-2xl"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                />
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.slice(0, 2).map((s, i) => (
                      <button 
                        key={i}
                        onClick={() => handleSuggestion(s)}
                        className="text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/10 hover:border-primary/50 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {s.split(' ').slice(0, 4).join(' ')}...
                      </button>
                    ))}
                  </div>
                  <Button 
                    size="lg" 
                    onClick={handleGenerate}
                    disabled={!prompt.trim()}
                    className="w-full sm:w-auto"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Looks
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {generateMutation.isPending && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 w-full"
          >
            <LoadingState />
          </motion.div>
        )}

        {!generateMutation.isPending && looks.length > 0 && activeLook && (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 w-full max-w-5xl mx-auto p-4 md:p-8 flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={() => generateMutation.reset()}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" /> Start Over
              </button>
              
              <div className="flex items-center gap-2">
                {looks.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveLookIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      idx === activeLookIndex 
                        ? "bg-primary scale-125" 
                        : "bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Info & Actions */}
              <div className="lg:col-span-4 space-y-6 sticky top-28">
                <motion.div 
                  key={`title-${activeLookIndex}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium uppercase tracking-widest">
                    <Tags className="w-3 h-3" />
                    {activeLook.vibe}
                  </div>
                  <h2 className="text-4xl md:text-5xl font-serif text-foreground leading-tight">
                    {activeLook.title}
                  </h2>
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
                  <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 border-b border-white/10 pb-2">Stylist Notes</h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">
                    {activeLook.styleNotes}
                  </p>
                </motion.div>

                <Button 
                  size="lg" 
                  className="w-full h-14 text-sm"
                  onClick={() => setIsOrderModalOpen(true)}
                >
                  Configure & Save Look
                </Button>
              </div>

              {/* Right Column: Items List */}
              <div className="lg:col-span-8 glass-panel rounded-xl p-2 md:p-6">
                <motion.div 
                  key={`items-${activeLookIndex}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ staggerChildren: 0.1 }}
                  className="space-y-2"
                >
                  <h3 className="px-4 pt-4 pb-2 text-lg font-serif">Curated Pieces</h3>
                  {activeLook.items.map((item, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={idx}
                    >
                      <ItemRow item={item} />
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>

            {/* Navigation Arrows for desktop */}
            <div className="hidden lg:flex fixed top-1/2 -translate-y-1/2 left-4 right-4 justify-between pointer-events-none z-10 px-8">
              <button 
                className={`w-12 h-12 rounded-full glass-panel flex items-center justify-center pointer-events-auto transition-transform hover:scale-110 active:scale-95 ${activeLookIndex === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                onClick={() => setActiveLookIndex(prev => Math.max(0, prev - 1))}
              >
                <ChevronLeft className="w-6 h-6 text-foreground" />
              </button>
              <button 
                className={`w-12 h-12 rounded-full glass-panel flex items-center justify-center pointer-events-auto transition-transform hover:scale-110 active:scale-95 ${activeLookIndex === looks.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                onClick={() => setActiveLookIndex(prev => Math.min(looks.length - 1, prev + 1))}
              >
                <ChevronRight className="w-6 h-6 text-foreground" />
              </button>
            </div>
            
            {activeLook && (
              <OrderModal 
                isOpen={isOrderModalOpen} 
                onClose={() => setIsOrderModalOpen(false)} 
                look={activeLook}
                prompt={prompt}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
