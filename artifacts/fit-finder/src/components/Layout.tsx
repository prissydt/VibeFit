import { Link, useLocation } from "wouter";
import { Sparkles, Bookmark, ShoppingBag, User } from "lucide-react";
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
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/8 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#1B3A2F]/15 blur-[120px] pointer-events-none" />

      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <Sparkles className="w-5 h-5 text-[#C8935A] group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-serif text-2xl font-medium tracking-wide text-foreground">
              Vyb<span className="text-[#C8935A] italic">ly</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={cn(
                "text-xs font-medium uppercase tracking-widest transition-colors hover:text-primary",
                location === "/" || location === "/looks" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Create
            </Link>
            <Link 
              href="/profile" 
              className={cn(
                "text-xs font-medium uppercase tracking-widest transition-colors hover:text-primary flex items-center gap-1.5",
                location.startsWith("/profile") ? "text-primary" : "text-muted-foreground"
              )}
            >
              <User className="w-3.5 h-3.5" />
              Profile
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

      <main className="flex-1 flex flex-col w-full pb-16 md:pb-0">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-white/5 bg-background/90 backdrop-blur-xl flex justify-around items-center h-16" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <Link href="/" className={cn("flex flex-col items-center gap-0.5 text-[10px] uppercase tracking-widest transition-colors min-w-[44px] min-h-[44px] justify-center", location === "/" || location === "/looks" ? "text-[#C8935A]" : "text-muted-foreground")}>
          <Sparkles className="w-5 h-5" />Create
        </Link>
        <Link href="/profile" className={cn("flex flex-col items-center gap-0.5 text-[10px] uppercase tracking-widest transition-colors min-w-[44px] min-h-[44px] justify-center", location.startsWith("/profile") ? "text-[#C8935A]" : "text-muted-foreground")}>
          <User className="w-5 h-5" />Profile
        </Link>
        <Link href="/saved" className={cn("flex flex-col items-center gap-0.5 text-[10px] uppercase tracking-widest transition-colors min-w-[44px] min-h-[44px] justify-center", location.startsWith("/saved") ? "text-[#C8935A]" : "text-muted-foreground")}>
          <Bookmark className="w-5 h-5" />Saved
        </Link>
        <button onClick={() => setIsOpen(true)} className="relative flex flex-col items-center gap-0.5 text-[10px] uppercase tracking-widest text-muted-foreground min-w-[44px] min-h-[44px] justify-center">
          <ShoppingBag className="w-5 h-5" />Cart
          {count > 0 && <span className="absolute top-0 right-1 bg-[#C8935A] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{count}</span>}
        </button>
      </nav>
    </div>
  );
}
