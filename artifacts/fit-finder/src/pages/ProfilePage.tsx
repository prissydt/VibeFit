import { useState } from "react";
import { Layout } from "@/components/Layout";
import { ProfileForm } from "@/components/ProfileForm";
import { profileStore } from "@/lib/profileStore";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Tags, User, RefreshCw, Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  // Using a local state to re-render when reset is called, though ProfileForm manages its own state for fields.
  const [profileId, setProfileId] = useState(profileStore.get().profileId);

  const p = profileStore.get();
  const likedCount = p.likedLookIds?.length || 0;

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
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5 cursor-pointer hover:text-primary transition-colors" onClick={() => setLocation('/saved')}>
                <Bookmark className="w-4 h-4" />
                {likedCount} Liked Looks
              </span>
            </div>
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
