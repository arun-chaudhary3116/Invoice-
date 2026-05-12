import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

export function GoogleButton() {
  const { google } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="w-full flex justify-center [&>div]:w-full">
      <GoogleLogin
        theme="filled_black"
        shape="pill"
        size="large"
        text="continue_with"
        width="360"
        onSuccess={async (resp) => {
          try {
            if (!resp.credential) throw new Error("No credential from Google");
            await google(resp.credential);
            toast.success("Welcome back!");
            navigate({ to: "/dashboard" });
          } catch (e: any) {
            toast.error(e?.message ?? "Google sign-in failed");
          }
        }}
        onError={() => toast.error("Google sign-in failed")}
      />
    </div>
  );
}
