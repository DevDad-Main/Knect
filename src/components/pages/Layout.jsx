import React, { useState, useEffect } from "react";
import SideBar from "../SideBar";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Loading from "../Loading";
import { useApp } from "../AppContext";
import { useSelector } from "react-redux";

const Layout = () => {
  const [sideBarOpen, setSideBarOpen] = React.useState(false);
  const { user, loading } = useApp();

  return !loading && user ? (
    <div className="w-full h-screen flex">
      {/* Desktop Sidebar - Fixed on large screens */}
      <div className="hidden lg:block">
        <SideBar
          sideBarOpen={true} // Always open on desktop
          setSideBarOpen={setSideBarOpen}
          user={user}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 bg-secondary lg:ml-60 xl:ml-72 relative">
        <Outlet />
        
        {/* Mobile/Tablet toggle button */}
        {!sideBarOpen ? (
          <Menu
            className="absolute top-3 left-3 p-2 z-50 bg-primary rounded-md shadow w-10 h-10 text-tertiary lg:hidden"
            onClick={() => setSideBarOpen(true)}
          />
        ) : null}
      </div>

      {/* Mobile/Tablet Sidebar - Overlays content */}
      {sideBarOpen && (
        <div className="lg:hidden">
          <SideBar
            sideBarOpen={sideBarOpen}
            setSideBarOpen={setSideBarOpen}
            user={user}
          />
          {/* Close button overlay */}
          <X
            className="absolute top-3 left-3 p-2 z-50 bg-primary rounded-md shadow w-10 h-10 text-tertiary lg:hidden"
            onClick={() => setSideBarOpen(false)}
          />
        </div>
      )}
    </div>
  ) : (
    <Loading />
  );
};

export default Layout;
