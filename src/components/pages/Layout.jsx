import React from "react";
import SideBar from "../SideBar";
import BottomNav from "../BottomNav";
import TopBar from "../TopBar";
import { Outlet, useLocation } from "react-router-dom";
import Loading from "../Loading";
import { useApp } from "../AppContext";

const Layout = () => {
  const { user, loading } = useApp();
  const location = useLocation();
  const setSideBarOpen = () => {}; // No-op since sidebar is always open on desktop

  // Check if we're in chat/call routes - prevent page scrolling
  const isChatRoute = location.pathname.startsWith('/messages') || location.pathname.startsWith('/call/');

  return !loading && user ? (
    <div className={`min-h-screen bg-secondary ${isChatRoute ? 'overflow-hidden' : ''}`}>
      {/* Top Bar with Theme Toggle */}
      <TopBar />
      
      {/* Desktop Sidebar - Fixed on large screens */}
      <SideBar
        sideBarOpen={true} // Always open on desktop
        setSideBarOpen={setSideBarOpen}
        user={user}
      />

      {/* Main content */}
      <div className={`lg:ml-60 xl:ml-72 pt-16 lg:pt-0 ${isChatRoute ? 'h-screen overflow-hidden pb-0' : 'pb-20 lg:pb-8'}`}>
        <Outlet />
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  ) : (
    <Loading />
  );
};

export default Layout;
