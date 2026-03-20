import { 
  ExternalLink, 
  Shirt, 
  Footprints, 
  Briefcase, 
  Gem, 
  Palette, 
  Scissors, 
  ShoppingBag,
  Type
} from "lucide-react";
import type { OutfitItem } from "@workspace/api-client-react/src/generated/api.schemas";
import { formatPrice } from "@/lib/utils";

const CategoryIcon = ({ category, className }: { category: string, className?: string }) => {
  const cat = category.toLowerCase();
  if (cat.includes('top') || cat.includes('shirt') || cat.includes('jacket')) return <Shirt className={className} />;
  if (cat.includes('bottom') || cat.includes('pant') || cat.includes('skirt')) return <ShoppingBag className={className} />; // Generic, maybe we need a pants icon, using shopping bag
  if (cat.includes('shoe') || cat.includes('foot') || cat.includes('boot')) return <Footprints className={className} />;
  if (cat.includes('bag') || cat.includes('purse')) return <Briefcase className={className} />;
  if (cat.includes('jewel') || cat.includes('accessor')) return <Gem className={className} />;
  if (cat.includes('makeup') || cat.includes('face') || cat.includes('lip')) return <Palette className={className} />;
  if (cat.includes('hair')) return <Scissors className={className} />;
  return <Type className={className} />;
};

export function ItemRow({ item }: { item: OutfitItem }) {
  return (
    <div className="group relative flex items-start gap-4 p-4 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300">
      <div className="flex-shrink-0 w-12 h-12 rounded-md bg-secondary/50 flex items-center justify-center border border-white/5 group-hover:bg-primary/10 transition-colors">
        <CategoryIcon category={item.category} className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary truncate">
            {item.brand}
          </p>
          <span className="text-sm font-medium text-foreground whitespace-nowrap">
            {formatPrice(item.price)}
          </span>
        </div>
        
        <h4 className="text-sm font-medium text-foreground/90 truncate mb-1">
          {item.name}
        </h4>
        
        <p className="text-xs text-muted-foreground line-clamp-1">
          {item.description}
        </p>
        
        {item.color && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="w-2 h-2 rounded-full border border-white/20" style={{ backgroundColor: item.color.toLowerCase() }} />
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.color}</span>
          </div>
        )}
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        <button 
          onClick={() => window.open(item.purchaseUrl, '_blank')}
          className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-transform"
          title="Shop Item"
        >
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
