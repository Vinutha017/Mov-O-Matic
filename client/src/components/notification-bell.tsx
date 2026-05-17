import { Bell, CheckCheck, CloudRain, Globe, Handshake, ShieldCheck, Sparkles } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/use-notifications";

const iconMap = {
  trip: Sparkles,
  collaboration: Handshake,
  weather: CloudRain,
  system: ShieldCheck,
};

export default function NotificationBell() {
  const { notifications, unreadCount, markNotificationAsRead, markAllNotificationsAsRead } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <DropdownMenuLabel className="p-0 text-sm font-semibold">Notifications</DropdownMenuLabel>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={markAllNotificationsAsRead}>
              <CheckCheck className="mr-1 h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              <Globe className="mx-auto mb-2 h-5 w-5 text-gray-400" />
              No notifications yet.
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = iconMap[notification.type] || Bell;
              return (
                <button
                  key={notification.id}
                  className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-gray-50 ${notification.isRead ? "opacity-70" : "bg-orange-50/60"}`}
                  onClick={() => markNotificationAsRead(notification.id)}
                >
                  <div className="mt-0.5 rounded-full bg-white p-2 shadow-sm">
                    <Icon className="h-4 w-4 text-orange-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                      {!notification.isRead && <span className="mt-1 h-2 w-2 rounded-full bg-orange-500" />}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-gray-600">{notification.description}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-wide text-gray-400">
                      {new Date(notification.createdAt).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
