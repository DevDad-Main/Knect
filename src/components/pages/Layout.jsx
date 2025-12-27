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
      {/* Sidebar */}
      <div className="hidden md:block fixed top-0 left-0 h-full w-60 xl:w-72">
        <SideBar
          sideBarOpen={sideBarOpen}
          setSideBarOpen={setSideBarOpen}
          user={user}
        />
      </div>

      {/* Main content → shifted only on md+ */}
      <div className="flex-1 bg-slate-50 md:ml-60 xl:ml-72">
        <Outlet />
      </div>

      {/* Mobile Sidebar (slides over content) */}
      <div className="md:hidden">
        <SideBar
          sideBarOpen={sideBarOpen}
          setSideBarOpen={setSideBarOpen}
          user={user}
        />
      </div>

      {/* Mobile toggle button */}
      {sideBarOpen ? (
        <X
          className="absolute top-3 right-3 p-2 z-50 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden"
          onClick={() => setSideBarOpen(false)}
        />
      ) : (
        <Menu
          className="absolute top-3 right-3 p-2 z-50 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden"
          onClick={() => setSideBarOpen(true)}
        />
      )}
    </div>
  ) : (
    <Loading />
  );
};

export default Layout;
