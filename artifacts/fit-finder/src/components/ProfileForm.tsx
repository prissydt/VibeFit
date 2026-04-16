import { useState, useEffect, useRef } from "react";
import { profileStore, type UserProfile } from "@/lib/profileStore";
import { useUpsertProfile, useUpsertUser } from "@workspace/api-client-react";
import { X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SKIN_TONES = [
  { id: "fair", color: "#f5e6d3" },
  { id: "light", color: "#f0d5b0" },
  { id: "medium", color: "#c8956c" },
  { id: "olive", color: "#a67c52" },
  { id: "tan", color: "#8d5524" },
  { id: "deep", color: "#5c3317" },
  { id: "rich", color: "#3b1f0e" },
] as const;

export function ProfileForm() {
  const [profile, setProfile] = useState<UserProfile>(profileStore.get());
  const [styleInput, setStyleInput] = useState("");
  const [avoidInput, setAvoidInput] = useState("");
  const upsertMutation = useUpsertProfile();
  const upsertUserMutation = useUpsertUser();
  
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleChange = (updates: Partial<UserProfile>) => {
    const newProfile = profileStore.set(updates);
    setProfile(newProfile);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      upsertMutation.mutate({ data: newProfile as any });
      upsertUserMutation.mutate({
        data: {
          id: newProfile.profileId,
          email: newProfile.email || undefined,
        },
      });
    }, 1000);
  };

  const handleAddStyle = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = styleInput.trim();
      if (val && !profile.stylePreferences?.includes(val)) {
        handleChange({ stylePreferences: [...(profile.stylePreferences || []), val] });
        setStyleInput("");
      }
    }
  };

  const handleRemoveStyle = (tag: string) => {
    handleChange({ stylePreferences: profile.stylePreferences?.filter(t => t !== tag) });
  };

  const handleAddAvoid = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = avoidInput.trim();
      if (val && !profile.avoidKeywords?.includes(val)) {
        handleChange({ avoidKeywords: [...(profile.avoidKeywords || []), val] });
        setAvoidInput("");
      }
    }
  };

  const handleRemoveAvoid = (tag: string) => {
    handleChange({ avoidKeywords: profile.avoidKeywords?.filter(t => t !== tag) });
  };

  return (
    <div className="space-y-6 pt-4 mt-4 border-t border-white/5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] text-muted-foreground uppercase tracking-widest">Name</label>
          <Input 
            value={profile.name || ""} 
            onChange={e => handleChange({ name: e.target.value })} 
            placeholder="Your name"
            className="bg-black/40 border-white/10"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] text-muted-foreground uppercase tracking-widest">Age</label>
          <Input 
            type="number"
            min={13} max={99}
            value={profile.age || ""} 
            onChange={e => handleChange({ age: parseInt(e.target.value) || undefined })} 
            placeholder="Age"
            className="bg-black/40 border-white/10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] text-muted-foreground uppercase tracking-widest">Email for purchases and receipts</label>
        <Input
          type="email"
          value={profile.email || ""}
          onChange={e => handleChange({ email: e.target.value })}
          placeholder="you@example.com"
          className="bg-black/40 border-white/10"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] text-muted-foreground uppercase tracking-widest">Gender</label>
        <div className="flex flex-wrap gap-2">
          {["woman", "man", "non-binary", "prefer-not-to-say"].map(g => (
            <button
              key={g}
              onClick={() => handleChange({ gender: g as any })}
              className={cn(
                "px-3 py-1.5 text-sm rounded-full border transition-all",
                profile.gender === g 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-black/40 border-white/10 hover:border-white/30 text-muted-foreground"
              )}
            >
              {g === "prefer-not-to-say" ? "Prefer not to say" : g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] text-muted-foreground uppercase tracking-widest">Skin Tone</label>
        <div className="flex flex-wrap gap-3">
          {SKIN_TONES.map(tone => (
            <button
              key={tone.id}
              onClick={() => handleChange({ skinTone: tone.id as any })}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                profile.skinTone === tone.id ? "ring-2 ring-white ring-offset-2 ring-offset-background scale-110" : "hover:scale-110"
              )}
              style={{ backgroundColor: tone.color }}
              title={tone.id}
            >
              {profile.skinTone === tone.id && (
                <Check className={cn("w-4 h-4", ["fair", "light"].includes(tone.id) ? "text-black" : "text-white")} />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] text-muted-foreground uppercase tracking-widest">Location</label>
        <Input 
          value={profile.location || ""} 
          onChange={e => handleChange({ location: e.target.value })} 
          placeholder="City or country"
          className="bg-black/40 border-white/10"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[10px] text-muted-foreground uppercase tracking-widest">Style Loves (Tags)</label>
        <div className="p-2 border border-white/10 rounded-md bg-black/40 flex flex-wrap gap-2 min-h-[42px]">
          {profile.stylePreferences?.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-full text-xs">
              {tag}
              <button onClick={() => handleRemoveStyle(tag)} className="hover:text-primary/70">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={styleInput}
            onChange={e => setStyleInput(e.target.value)}
            onKeyDown={handleAddStyle}
            placeholder="Type and press Enter..."
            className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] text-muted-foreground uppercase tracking-widest">Avoid (Tags)</label>
        <div className="p-2 border border-white/10 rounded-md bg-black/40 flex flex-wrap gap-2 min-h-[42px]">
          {profile.avoidKeywords?.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 bg-destructive/10 text-destructive border border-destructive/20 px-2 py-1 rounded-full text-xs">
              {tag}
              <button onClick={() => handleRemoveAvoid(tag)} className="hover:text-destructive/70">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={avoidInput}
            onChange={e => setAvoidInput(e.target.value)}
            onKeyDown={handleAddAvoid}
            placeholder="Type and press Enter..."
            className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
}
