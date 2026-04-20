import { Link } from "wouter";
import { Layout } from "@/components/Layout";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <Sparkles className="w-12 h-12 text-[#C8935A] opacity-60" />
        <div className="space-y-2">
          <h1 className="text-6xl font-serif text-foreground">404</h1>
          <p className="text-muted-foreground">This page doesn't exist.</p>
        </div>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </Layout>
  );
}
