import { useRoute } from "wouter";
import { useGetSavedOutfit, getGetSavedOutfitQueryOptions } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { ItemRow } from "@/components/ItemRow";
import { ModelView } from "@/components/ModelView";
import { formatPrice } from "@/lib/utils";
import { Loader2, ArrowLeft, Calendar, Tag, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

export default function SavedLookDetail() {
  const [, params] = useRoute("/saved/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  
  const queryOptions = getGetSavedOutfitQueryOptions(id);
  const { data, isLoading, isError } = useGetSavedOutfit(id, {
    query: { ...queryOptions, enabled: !!id }
  });

  const { addFullOutfit } = useCart();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </Layout>
    );
  }

  if (isError || !data) {
    return (
      <Layout>
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <h2 className="text-2xl font-serif mb-2">Look Not Found</h2>
          <p className="text-muted-foreground mb-6">This outfit may have been deleted.</p>
          <Link href="/saved" className="text-primary hover:underline">Return to Wardrobe</Link>
        </div>
      </Layout>
    );
  }

  const { look, prompt, savedAt, userSizes } = data;
  const date = new Date(savedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Layout>
      <div className="w-full max-w-6xl mx-auto p-4 md:p-8">
        <Link href="/saved" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Wardrobe
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Model Column */}
          <div className="h-[60vh] lg:h-[80vh] sticky top-28">
             <ModelView look={look} userSizes={userSizes} />
          </div>

          {/* Info Column */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] uppercase tracking-widest px-2 py-1 rounded bg-secondary text-muted-foreground border border-white/5">
                  {look.vibe}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4 leading-tight">
                {look.title}
              </h1>
              <div className="text-3xl font-light text-primary mb-6">
                {formatPrice(look.totalCost)}
              </div>
              
              <div className="glass-panel p-5 rounded-lg space-y-4">
                <div className="flex gap-3">
                  <Tag className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Original Prompt</p>
                    <p className="text-sm italic text-foreground/80">"{prompt}"</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Archived On</p>
                    <p className="text-sm text-foreground/80">{date}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sizes */}
            {userSizes && Object.values(userSizes).some(v => v) && (
              <div className="glass-panel p-5 rounded-lg border-primary/20">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">Saved Sizing Profile</h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  {userSizes.top && (
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">Top</p>
                      <p className="text-sm font-medium">{userSizes.top}</p>
                    </div>
                  )}
                  {userSizes.bottom && (
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">Bottom</p>
                      <p className="text-sm font-medium">{userSizes.bottom}</p>
                    </div>
                  )}
                  {userSizes.shoes && (
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">Shoes</p>
                      <p className="text-sm font-medium">{userSizes.shoes}</p>
                    </div>
                  )}
                  {userSizes.dress && (
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">Dress</p>
                      <p className="text-sm font-medium">{userSizes.dress}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Stylist Notes</h4>
              <p className="text-sm text-foreground/80 leading-relaxed">
                {look.styleNotes}
              </p>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-4">
              <h3 className="text-lg font-serif px-2 mb-2">The Collection ({look.items.length} pieces)</h3>
              <div className="glass-panel rounded-xl p-2 md:p-6">
                <div className="space-y-2">
                  {look.items.map((item, idx) => (
                    <ItemRow key={idx} item={item} lookId={look.id} lookTitle={look.title} />
                  ))}
                </div>
              </div>
              
              <Button 
                className="w-full h-14 mt-4" 
                onClick={() => addFullOutfit(look)}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Add Full Look to Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
