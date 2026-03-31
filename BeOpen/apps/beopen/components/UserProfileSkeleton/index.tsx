import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default function UserProfileSkeleton() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="items-center text-center">
        <Skeleton className="size-20 rounded-full mb-2" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-52 mt-1" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
