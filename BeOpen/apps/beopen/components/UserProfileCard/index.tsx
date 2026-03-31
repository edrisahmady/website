import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";

export type UserProfile = {
  id?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
  picture?: string;
  verified_email?: boolean;
};

type UserProfileCardProps = {
  user: UserProfile;
};

export default function UserProfileCard({ user }: UserProfileCardProps) {
  const initials = [user.given_name?.[0], user.family_name?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "?";

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center text-center">
        <Avatar className="size-20 mb-2">
          <AvatarImage src={user.picture} alt={user.name ?? "User avatar"} />
          <AvatarFallback className="text-2xl font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <CardTitle className="text-xl">{user.name ?? "Unknown User"}</CardTitle>
        <CardDescription className="flex items-center gap-1.5">
          <Icon icon="mail" className="size-3.5" />
          {user.email ?? "No email"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Info rows */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">First Name</span>
            <span className="font-medium">{user.given_name ?? "—"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">Last Name</span>
            <span className="font-medium">{user.family_name ?? "—"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">User ID</span>
            <span className="font-medium font-mono text-xs">{user.id ?? "—"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground">Email Verified</span>
            <div>
              {user.verified_email ? (
                <Badge variant="default">
                  <Icon icon="check" className="size-3" /> Verified
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <Icon icon="x" className="size-3" /> Not Verified
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
