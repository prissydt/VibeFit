import { Link, useLocation } from "wouter";
import { Sparkles, Bookmark, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { CartDrawer } from "@/components/CartDrawer";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { count, setIsOpen } = useCart();

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <CartDrawer />
      {/* Ambient background glow */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Sparkles className="w-5 h-5 text-primary group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-serif text-2xl font-medium tracking-wide text-foreground">
              FIT<span className="text-primary italic">FINDER</span>
            </span>
          </Link>

          <nav className="flex items-center gap-6">
            <Link 
              href="/" 
              className={cn(
                "text-xs font-medium uppercase tracking-widest transition-colors hover:text-primary",
                location === "/" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Create
            </Link>
            <Link 
              href="/saved" 
              className={cn(
                "text-xs font-medium uppercase tracking-widest transition-colors hover:text-primary flex items-center gap-1.5",
                location.startsWith("/saved") ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Bookmark className="w-3.5 h-3.5" />
              Saved
            </Link>
            <button 
              onClick={() => setIsOpen(true)}
              className="text-xs font-medium uppercase tracking-widest transition-colors hover:text-primary flex items-center gap-1.5 relative text-muted-foreground"
            >
              <ShoppingBag className="w-4 h-4" />
              Cart
              {count > 0 && (
                <span className="absolute -top-2 -right-3 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {count}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full">
        {children}
      </main>
    </div>
  );
}
