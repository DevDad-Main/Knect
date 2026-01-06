import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, MessageCircle, Search, UserIcon, Users, Bell, PlusSquare } from "lucide-react";
import { useCurrentUser } from "../hooks/useCurrentUser";

const navItems = [
  { icon: Home, label: "Feed", path: "/feed" },
  { icon: Search, label: "Discover", path: "/discover" },
  { icon: PlusSquare, label: "Create", path: "/create-post" },
  { icon: MessageCircle, label: "Messages", path: "/messages" },
  { icon: Users, label: "Connections", path: "/connections" },
  { icon: UserIcon, label: "Profile", path: `/profile/${""}` },
];

const BottomNav = () => {
  const currentUser = useCurrentUser();
  const location = useLocation().pathname;

  // Update profile path with current user ID
  const updatedNavItems = navItems.map(item => 
    item.label === "Profile" 
      ? { ...item, path: `/profile/${currentUser?._id || ""}` }
      : item
  );

  // Hide bottom navigation only in actual chat and call routes
  if ((location.startsWith('/messages/') && location !== '/messages') || location.startsWith('/call/')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-primary border-t border-secondary z-50 lg:hidden">
      <div className="flex items-center justify-around px-2 py-3">
        {updatedNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                isActive 
                  ? "text-indigo-600 dark:text-indigo-400" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Icon className={`h-6 w-6 ${isActive ? "fill-current" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;