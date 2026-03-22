import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ProfileForm } from "@/components/ProfileForm";
import { profileStore } from "@/lib/profileStore";
import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
import { User, RefreshCw, ArrowRight, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGetSavedOutfits, useDeleteSavedOutfit } from "@workspace/api-client-react";
import { formatPrice } from "@/lib/utils";
import { Trash2 } from "lucide-react";

const SKIN_TONES: Record<string, string> = {
  fair: "#f5e6d3",
  light: "#f0d5b0",
  medium: "#c8956c",
  olive: "#a67c52",
  tan: "#8d5524",
  deep: "#5c3317",
  rich: "#3b1f0e",
};

export default function ProfilePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [profileId, setProfileId] = useState(profileStore.get().profileId);

  const p = profileStore.get();
  const { data: savedData, isLoading: savedLoading, refetch: refetchSaved } = useGetSavedOutfits({ profileId: p.profileId });
  const deleteMutation = useDeleteSavedOutfit();

  const handleDeleteSaved = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    deleteMutation.mutate({ id }, { onSuccess: () => refetchSaved() });
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset your profile? This will clear all preferences.")) {
      localStorage.removeItem("fitfinder_profile");
      setProfileId(profileStore.get().profileId);
      toast({ title: "Profile reset successfully" });
      window.location.reload();
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center p-4 w-full max-w-3xl mx-auto my-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif text-foreground">
            Your Style Profile
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            The more you tell us, the better your looks get.
          </p>
        </div>

        {/* Style DNA summary card */}
        <div className="w-full glass-panel p-6 rounded-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-lg font-serif flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Style DNA
            </h2>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            {p.gender && (
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium uppercase tracking-wider">
                {p.gender}
              </span>
            )}
            {p.age && (
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium uppercase tracking-wider">
                Age: {p.age}
              </span>
            )}
            {p.skinTone && (
              <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium uppercase tracking-wider flex items-center gap-2">
                Skin Tone: 
                <span className="w-4 h-4 rounded-full border border-white/20 inline-block" style={{ backgroundColor: SKIN_TONES[p.skinTone] }} />
              </span>
            )}
          </div>
          
          {p.stylePreferences && p.stylePreferences.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Loves</div>
              <div className="flex flex-wrap gap-2">
                {p.stylePreferences.map(t => (
                  <span key={t} className="px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 text-xs">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

          {p.avoidKeywords && p.avoidKeywords.length > 0 && (
            <div className="space-y-2">
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest">Avoids</div>
              <div className="flex flex-wrap gap-2">
                {p.avoidKeywords.map(t => (
                  <span key={t} className="px-2.5 py-1 rounded-md bg-destructive/10 text-destructive border border-destructive/20 text-xs">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Saved Looks */}
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-serif">Saved Looks</h2>
            {(savedData?.outfits?.length ?? 0) > 0 && (
              <Link href="/saved" className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {savedLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : !savedData?.outfits?.length ? (
            <div className="glass-panel rounded-xl p-10 text-center">
              <p className="text-muted-foreground text-sm mb-4">No looks saved yet. Generate outfits and tap Save to collect looks here.</p>
              <button
                onClick={() => setLocation("/")}
                className="text-xs uppercase tracking-widest font-medium text-primary border-b border-primary pb-1 hover:text-white hover:border-white transition-colors"
              >
                Start Creating
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {savedData.outfits.map((saved) => (
                <Link key={saved.id} href={`/saved/${saved.id}`}>
                  <div className="group relative glass-panel rounded-xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5">
                    <div className="aspect-[3/4] relative bg-secondary/50 overflow-hidden">
                      {saved.look.modelImageB64 ? (
                        <img
                          src={`data:image/png;base64,${saved.look.modelImageB64}`}
                          alt={saved.look.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                          <ImageIcon className="w-10 h-10" />
                        </div>
                      )}
                      <button
                        onClick={(e) => handleDeleteSaved(saved.id, e)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white/60 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 border border-white/10"
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-serif line-clamp-1 group-hover:text-primary transition-colors">{saved.look.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatPrice(saved.look.totalCost)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Full Form */}
        <div className="w-full bg-background/80 backdrop-blur-md border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-serif mb-4">Edit Profile</h3>
          <ProfileForm key={profileId} />
        </div>

        <div className="w-full flex justify-end">
          <Button variant="ghost" onClick={handleReset} className="text-destructive hover:bg-destructive/10 hover:text-destructive">
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Profile
          </Button>
        </div>
      </div>
    </Layout>
  );
}
