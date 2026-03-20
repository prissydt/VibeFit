import { useGetSavedOutfits, useDeleteSavedOutfit } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import { Trash2, ArrowRight, Loader2, BookmarkX, Image as ImageIcon } from "lucide-react";

export default function SavedLooks() {
  const { data, isLoading, refetch } = useGetSavedOutfits();
  const deleteMutation = useDeleteSavedOutfit();

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to detail
    if (confirm("Are you sure you want to remove this look from your wardrobe?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => refetch()
      });
    }
  };

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto p-4 md:p-8 lg:py-12">
        <div className="mb-10 border-b border-border pb-6">
          <h1 className="text-4xl font-serif text-foreground mb-2">Your Wardrobe</h1>
          <p className="text-muted-foreground">Archived aesthetics and curated collections.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : !data?.outfits?.length ? (
          <div className="text-center py-20 glass-panel rounded-xl max-w-lg mx-auto">
            <BookmarkX className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-serif text-foreground mb-2">The Archive is Empty</h3>
            <p className="text-sm text-muted-foreground mb-6">You haven't saved any looks yet. Generate some inspiration to get started.</p>
            <Link href="/">
              <button className="text-xs uppercase tracking-widest font-medium text-primary border-b border-primary pb-1 hover:text-white hover:border-white transition-colors">
                Start Creating
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.outfits.map((saved, idx) => (
              <Link key={saved.id} href={`/saved/${saved.id}`}>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group block h-full glass-panel rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 flex flex-col"
                >
                  <div className="h-48 w-full relative bg-secondary/50 overflow-hidden">
                    {saved.look.modelImageB64 ? (
                      <img 
                        src={`data:image/png;base64,${saved.look.modelImageB64}`} 
                        alt={saved.look.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-40 transition-opacity">
                        <ImageIcon className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-white border border-white/10">
                        {saved.look.vibe}
                      </span>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(saved.id, e)}
                      className="absolute top-4 right-4 p-2 rounded-full bg-black/60 backdrop-blur-sm text-white/70 hover:text-destructive hover:bg-black/80 transition-colors border border-white/10"
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-2xl font-serif text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-1">
                      {saved.look.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-6 flex-1">
                      Based on: "{saved.prompt}"
                    </p>

                    <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-0.5">Total Value</p>
                        <p className="text-lg font-light text-foreground">{formatPrice(saved.look.totalCost)}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-primary group-hover:translate-x-1 transition-transform">
                        View Details <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
