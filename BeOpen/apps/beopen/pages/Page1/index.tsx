import { useCallback } from "react";
import { useApi, logoutIntegrations } from "@superblocksteam/library";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import UserProfileCard from "@/components/UserProfileCard";
import type { UserProfile } from "@/components/UserProfileCard";
import UserProfileSkeleton from "@/components/UserProfileSkeleton";

export default function Page1Component() {
  const { run: fetchProfile, loading, data } = useApi("GetUserProfile");

  const handleFetch = useCallback(async () => {
    try {
      await fetchProfile({});
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message: unknown }).message)
          : String(error);
      toast.error("Failed to fetch profile: " + message);
    }
  }, [fetchProfile]);

  const handleLogout = useCallback(async () => {
    try {
      await logoutIntegrations();
      toast.success("Logged out — you'll be prompted to re-authorize on next fetch.");
    } catch {
      toast.error("Failed to logout integrations.");
    }
  }, []);

  const user: UserProfile | null = data ? (data as any)?.output ?? data : null;

  return (
    <div className="flex flex-col items-center min-h-screen overflow-auto p-6 bg-background">
      <div className="flex flex-col items-center gap-2 mt-16 mb-8">
        <h1 className="text-3xl font-bold text-foreground">User Profile</h1>
        <p className="text-muted-foreground text-sm">
          Google OAuth2 Authorization Code Flow
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3 mb-8">
        <Button onClick={handleFetch} disabled={loading}>
          <Icon icon="user" className="size-4" />
          {loading ? "Fetching..." : "Fetch User Profile"}
        </Button>
        <Button variant="outline" onClick={handleLogout}>
          <Icon icon="log-out" className="size-4" />
          Clear Auth / Logout
        </Button>
      </div>

      {/* Profile card */}
      {loading && !data ? (
        <UserProfileSkeleton />
      ) : user ? (
        <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
          <UserProfileCard user={user} />

          {/* Raw API response */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-base">Raw API Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted rounded-lg p-4 text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
                {JSON.stringify(user, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      ) : (
        <p className="text-muted-foreground">
          Click "Fetch User Profile" to call the /userinfo endpoint.
        </p>
      )}
    </div>
  );
}
