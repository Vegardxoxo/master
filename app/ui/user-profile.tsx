import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { lusitana } from "@/app/ui/fonts";

export default function UserProfile({ user }: { user: any }) {
  // Get initials for the avatar fallback
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n: string[]) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "U";

  // Get display name (use name if available, otherwise use email)
  const displayName = user?.name || user?.email?.split("@")[0] || "User";

  return (
    <div className="flex items-center gap-3 p-4">
      <Avatar className="h-10 w-10 border-2 border-white/20">
        <AvatarImage src={user?.image || ""} alt={displayName} />
        <AvatarFallback className="bg-sky-600 text-white">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col overflow-hidden">
        <p className={`${lusitana.className} font-medium text-white truncate`}>
          {displayName}
        </p>
        {user?.email && (
          <p className="text-xs text-white/70 truncate">{user.email}</p>
        )}
      </div>
    </div>
  );
}
