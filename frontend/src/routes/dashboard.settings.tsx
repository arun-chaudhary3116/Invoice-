import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Camera, Check, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/settings")({
  head: () => ({ meta: [{ title: "Settings — Ledgerly" }] }),
  component: SettingsPage,
});

const API = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("ledgerly_token");
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || data?.message || "Request failed");
  return data;
}

// ─────────────────────────────
// TYPES
// ─────────────────────────────
type StripeStatus =
  | { connected: false }
  | {
      connected: true;
      accountId: string;
      email: string | null;
      businessName: string | null;
      chargesEnabled: boolean;
      payoutsEnabled: boolean;
      detailsSubmitted: boolean;
    };

// ─────────────────────────────
// PROFILE SECTION
// ─────────────────────────────
function ProfileSection() {
  const { user, refresh } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState(user?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("ledgerly_token");
      const formData = new FormData();
      formData.append("name", name);
      if (file) formData.append("avatar", file);

      const res = await fetch(`${API}/api/auth/me`, {
        method: "PATCH",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Update failed:", data);
        throw new Error(data?.message || "Failed to update");
      }

      console.log("Update response:", data);

      // Re-fetch user from server so avatar updates everywhere
      await refresh();
      console.log("Refresh completed");

      setFile(null);
      setPreview(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      toast.success("Profile updated");
    } catch (e: any) {
      console.error("Save error:", e);
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // Add cache busting for uploaded avatars
  const displayAvatar =
    user?.avatar && user?.avatarSource === "upload"
      ? `${user.avatar}${user.avatar.includes("?") ? "&" : "?"}nocache=${Date.now()}`
      : (user?.avatar ?? "");
  const avatarSrc = preview ?? displayAvatar;
  const initials = (user?.name ?? "?")[0].toUpperCase();
  const hasChanges = name !== (user?.name ?? "") || file !== null;

  return (
    <div className="rounded-xl border border-border/60 bg-surface/60 p-6 space-y-5">
      <h2 className="font-semibold">Profile</h2>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative group">
          <Avatar className="size-16">
            <AvatarImage src={avatarSrc} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>
          <button
            onClick={() => fileRef.current?.click()}
            className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            title="Change photo"
          >
            <Camera className="size-5 text-white" />
          </button>
        </div>
        <div>
          <button
            onClick={() => fileRef.current?.click()}
            className="text-sm font-medium hover:underline"
          >
            Change photo
          </button>
          <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WebP · max 5MB</p>
          {preview && (
            <button
              onClick={() => {
                setPreview(null);
                setFile(null);
              }}
              className="text-xs text-rose-400 hover:underline mt-1"
            >
              Remove
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {/* Name */}
      <div className="space-y-1.5">
        <Label>Display name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="max-w-sm"
        />
      </div>

      {/* Email (read-only) */}
      <div className="space-y-1.5">
        <Label>Email</Label>
        <Input value={user?.email ?? ""} disabled className="max-w-sm opacity-60" />
        <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
      </div>

      {/* Save */}
      <Button
        onClick={handleSave}
        disabled={saving || !hasChanges}
        className="rounded-full bg-foreground text-primary-foreground hover:opacity-90 gap-2"
      >
        {saving ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Saving…
          </>
        ) : saved ? (
          <>
            <Check className="size-4" /> Saved
          </>
        ) : (
          "Save changes"
        )}
      </Button>
    </div>
  );
}

// ─────────────────────────────
// STRIPE MODAL
// ─────────────────────────────
function StripeConnectModal({
  onClose,
  onContinue,
}: {
  onClose: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white text-zinc-900 p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Connect Stripe</h2>
        <p className="text-sm text-zinc-500 mt-2">
          You'll be redirected to Stripe to complete setup. This lets your clients pay invoices
          online.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-zinc-200 rounded-xl py-2 text-sm hover:bg-zinc-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onContinue}
            className="flex-1 bg-[#635BFF] text-white rounded-xl py-2 text-sm font-medium hover:bg-[#4f46e5] transition"
          >
            Continue to Stripe
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────
// STRIPE SECTION
// ─────────────────────────────
function StripeSection() {
  const [stripeStatus, setStripeStatus] = useState<StripeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const search = useSearch({ strict: false }) as Record<string, string | undefined>;

  const fetchStatus = useCallback(async () => {
    try {
      const data = await apiFetch<StripeStatus>("/api/stripe/connect/status");
      setStripeStatus(data);
    } catch {
      setStripeStatus({ connected: false });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  useEffect(() => {
    if (!search?.stripe) return;
    if (search.stripe === "connected") {
      toast.success("Stripe connected");
      fetchStatus();
    }
    if (search.stripe === "error") toast.error("Stripe connection failed");
    if (search.stripe === "refresh_needed") toast.error("Stripe link expired — please try again");
    const url = new URL(window.location.href);
    url.searchParams.delete("stripe");
    window.history.replaceState({}, "", url.toString());
  }, [search, fetchStatus]);

  const handleContinueToStripe = async () => {
    try {
      const data = await apiFetch<{ url: string }>("/api/stripe/connect/start");
      if (!data?.url) {
        toast.error("No onboarding link received");
        return;
      }
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err?.message || "Stripe error");
    }
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect Stripe? Your clients won't be able to pay online.")) return;
    setDisconnecting(true);
    try {
      await apiFetch("/api/stripe/connect", { method: "DELETE" });
      setStripeStatus({ connected: false });
      toast.success("Stripe disconnected");
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setDisconnecting(false);
    }
  };

  const isConnected = stripeStatus?.connected === true;
  const s = isConnected ? (stripeStatus as Extract<StripeStatus, { connected: true }>) : null;

  return (
    <>
      {showModal && (
        <StripeConnectModal
          onClose={() => setShowModal(false)}
          onContinue={handleContinueToStripe}
        />
      )}

      <div className="rounded-xl border border-border/60 bg-surface/60 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">Stripe</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Accept online payments from your clients.
            </p>
          </div>
          {/* Stripe wordmark */}
          <svg className="h-6 opacity-60" viewBox="0 0 60 25" fill="currentColor">
            <path d="M59.64 14.28h-8.06v-1.4c0-1.17.4-1.76 1.2-1.76.8 0 1.2.59 1.2 1.76v.56h5.66v-.56c0-3.52-1.96-5.28-6.86-5.28-4.9 0-6.86 1.76-6.86 5.28v3.52c0 3.52 1.96 5.28 6.86 5.28 4.9 0 6.86-1.76 6.86-5.28v-.12zm-5.66 1.4c0 1.17-.4 1.76-1.2 1.76-.8 0-1.2-.59-1.2-1.76v-.56h2.4v.56zM32.56 7.6c-1.96 0-3.52.78-4.5 2.34V7.84H22.5v16.64h5.66v-9.56c0-1.17.59-1.76 1.56-1.76s1.56.59 1.56 1.76v9.56h5.66V14.6c0-4.5-1.76-7-4.38-7zM16.06 4.08c-1.76 0-2.74 1.17-2.74 2.74s.98 2.74 2.74 2.74 2.74-1.17 2.74-2.74-.98-2.74-2.74-2.74zm-2.74 3.76H19v16.64h-5.68V7.84zM9.8 12.52V7.84H4.14v16.64H9.8V16.4c0-2.54 1.17-3.52 3.52-3.52h.39V7.6c-2.15 0-3.52.98-3.91 4.92z" />
          </svg>
        </div>

        {loading && <div className="h-10 bg-muted animate-pulse rounded-lg" />}

        {!loading && !isConnected && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-[#635BFF] text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-[#4f46e5] transition"
          >
            Connect Stripe
          </button>
        )}

        {!loading && isConnected && s && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <span
                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${s.chargesEnabled ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-amber-500/15 text-amber-300 border-amber-500/30"}`}
              >
                <span
                  className={`size-1.5 rounded-full ${s.chargesEnabled ? "bg-emerald-400" : "bg-amber-400"}`}
                />
                {s.chargesEnabled ? "Payments enabled" : "Setup incomplete"}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${s.payoutsEnabled ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" : "bg-muted text-muted-foreground border-border"}`}
              >
                <span
                  className={`size-1.5 rounded-full ${s.payoutsEnabled ? "bg-emerald-400" : "bg-muted-foreground"}`}
                />
                {s.payoutsEnabled ? "Payouts enabled" : "Payouts pending"}
              </span>
            </div>
            {s.email && <p className="text-sm text-muted-foreground">Account: {s.email}</p>}
            {!s.detailsSubmitted && (
              <p className="text-xs text-amber-300">
                Complete your Stripe onboarding to enable payments.{" "}
                <button onClick={handleContinueToStripe} className="underline">
                  Continue setup →
                </button>
              </p>
            )}
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="text-sm text-rose-400 hover:underline disabled:opacity-50"
            >
              {disconnecting ? "Disconnecting…" : "Disconnect Stripe"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ─────────────────────────────
// PAGE
// ─────────────────────────────
function SettingsPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
      <ProfileSection />
      <StripeSection />
    </div>
  );
}
