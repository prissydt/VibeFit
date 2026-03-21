import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGenerateOutfits } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { lookStore } from "@/lib/lookStore";
import { profileStore } from "@/lib/profileStore";
import { ProfileForm } from "@/components/ProfileForm";
import { cn } from "@/lib/utils";

// Pre-defined prompts for inspiration
const SUGGESTIONS = [
  "A moody, dark academia winter look for a coffee shop date",
  "Sleek minimalist evening wear for a gallery opening",
  "Edgy streetwear with metallic accents for a concert",
  "Quiet luxury weekend getaway in Aspen"
];

const BUDGET_OPTIONS = [
  { label: "$50", value: 50 },
  { label: "$100", value: 100 },
  { label: "$250", value: 250 },
  { label: "$500", value: 500 },
  { label: "$1000", value: 1000 },
  { label: "No limit", value: undefined }
];

function LoadingState() {
  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 space-y-12 flex-1 flex flex-col justify-center">
      <div className="text-center space-y-4">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 mx-auto rounded-full border-t-2 border-primary border-r-2 border-r-transparent flex items-center justify-center"
        >
          <Sparkles className="w-4 h-4 text-primary absolute" />
        </motion.div>
        <h2 className="text-2xl font-serif text-foreground">Curating Your Wardrobe...</h2>
        <p className="text-sm text-muted-foreground animate-pulse">Searching local & global collections...</p>
      </div>

      <div className="glass-panel p-8 rounded-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
        <div className="space-y-8 opacity-50">
          <div className="h-8 w-1/3 bg-white/10 rounded-sm" />
          <div className="grid gap-6">
            {[1, 2, 3].map(i => (
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
  const [, setLocation] = useLocation();
  const [prompt, setPrompt] = useState("");
  const [isSizesOpen, setIsSizesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [maxBudget, setMaxBudget] = useState<number | undefined>(undefined);
  const [customBudget, setCustomBudget] = useState("");

  const [sizes, setSizes] = useState({
    top: "",
    bottom: "",
    shoes: "",
    dress: ""
  });
  
  const generateMutation = useGenerateOutfits();

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    generateMutation.mutate({
      data: { 
        prompt, 
        numLooks: 4, 
        maxBudget,
        userSizes: sizes,
        userProfile: profileStore.get()
      }
    }, {
      onSuccess: (data) => {
        lookStore.set(data);
        setLocation("/looks");
      }
    });
  };

  const handleSuggestion = (text: string) => {
    setPrompt(text);
  };

  return (
    <Layout>
      <AnimatePresence mode="wait">
        {!generateMutation.isPending ? (
          <motion.div 
            key="search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-3xl mx-auto my-12"
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
                
                {/* Budget Form */}
                <div className="bg-background/80 backdrop-blur-md border border-white/10 rounded-lg p-4 transition-all">
                  <div className="space-y-3">
                    <label className="text-[10px] text-muted-foreground uppercase tracking-widest block">Max Budget (Optional)</label>
                    <div className="flex flex-wrap items-center gap-2">
                      {BUDGET_OPTIONS.map((opt) => (
                        <button
                          key={opt.label}
                          onClick={() => {
                            setMaxBudget(opt.value);
                            setCustomBudget("");
                          }}
                          className={cn(
                            "px-3 py-1.5 text-xs rounded-full border transition-all",
                            maxBudget === opt.value && customBudget === ""
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-black/40 border-white/10 hover:border-white/30 text-muted-foreground"
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-muted-foreground text-sm">$</span>
                        <Input
                          type="number"
                          placeholder="Custom"
                          value={customBudget}
                          onChange={(e) => {
                            setCustomBudget(e.target.value);
                            setMaxBudget(e.target.value ? Number(e.target.value) : undefined);
                          }}
                          className="w-24 h-8 text-xs bg-black/40 border-white/10"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sizes Form */}
                <div className="bg-background/80 backdrop-blur-md border border-white/10 rounded-lg p-4 transition-all">
                  <button 
                    onClick={() => setIsSizesOpen(!isSizesOpen)}
                    className="flex justify-between items-center w-full text-sm font-medium uppercase tracking-widest text-foreground hover:text-primary transition-colors"
                  >
                    My Sizes (Optional)
                    <ChevronRight className={`w-4 h-4 transition-transform ${isSizesOpen ? 'rotate-90' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isSizesOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                          <div className="space-y-2">
                            <label className="text-[10px] text-muted-foreground uppercase tracking-widest">Top Size</label>
                            <select 
                              value={sizes.top}
                              onChange={(e) => setSizes(prev => ({...prev, top: e.target.value}))}
                              className="w-full h-10 bg-black/40 border border-white/10 rounded px-3 text-sm focus:border-primary outline-none text-foreground"
                            >
                              <option value="">Select</option>
                              {['XS', 'S', 'M', 'L', 'XL', '2XL'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-[10px] text-muted-foreground uppercase tracking-widest">Bottom Size</label>
                            <input 
                              type="text"
                              placeholder="e.g. 28x30 or M"
                              value={sizes.bottom}
                              onChange={(e) => setSizes(prev => ({...prev, bottom: e.target.value}))}
                              className="w-full h-10 bg-black/40 border border-white/10 rounded px-3 text-sm focus:border-primary outline-none text-foreground"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] text-muted-foreground uppercase tracking-widest">Shoe Size (US)</label>
                            <select 
                              value={sizes.shoes}
                              onChange={(e) => setSizes(prev => ({...prev, shoes: e.target.value}))}
                              className="w-full h-10 bg-black/40 border border-white/10 rounded px-3 text-sm focus:border-primary outline-none text-foreground"
                            >
                              <option value="">Select</option>
                              {['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] text-muted-foreground uppercase tracking-widest">Dress Size</label>
                            <select 
                              value={sizes.dress}
                              onChange={(e) => setSizes(prev => ({...prev, dress: e.target.value}))}
                              className="w-full h-10 bg-black/40 border border-white/10 rounded px-3 text-sm focus:border-primary outline-none text-foreground"
                            >
                              <option value="">Select</option>
                              {['0', '2', '4', '6', '8', '10', '12', '14', '16'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Form */}
                <div className="bg-background/80 backdrop-blur-md border border-white/10 rounded-lg p-4 transition-all">
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex justify-between items-center w-full text-sm font-medium uppercase tracking-widest text-foreground hover:text-primary transition-colors"
                  >
                    My Profile (Optional)
                    <ChevronRight className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-90' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <ProfileForm />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
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
                    disabled={!prompt.trim() || generateMutation.isPending}
                    className="w-full sm:w-auto"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Looks
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 w-full flex flex-col"
          >
            <LoadingState />
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
