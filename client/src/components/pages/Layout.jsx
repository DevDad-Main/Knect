import React, { useState, useEffect } from "react";
import SideBar from "../SideBar";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Loading from "../Loading";
import { fetchData } from "../utils";
import { useSelector } from "react-redux";

const Layout = () => {
  const [user, setUserData] = useState(null);
  // const user = useSelector((state) => state.user.value);
  const [sideBarOpen, setSideBarOpen] = React.useState(false);
  const fetchUser = async () => {
    try {
      const data = await fetchData(`api/v1/user/user`);
      if (data) {
        setUserData(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);
  return user ? (
    <div className="w-full flex h-screen">
      <SideBar sideBarOpen={sideBarOpen} setSideBarOpen={setSideBarOpen} />
      <div className="flex-1 bg-slate-50">
        <Outlet />
      </div>
      {sideBarOpen ? (
        <X
          className="absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden"
          onClick={() => setSideBarOpen(false)}
        />
      ) : (
        <Menu
          className="absolute top-3 right-3 p-2 z-100 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden"
          onClick={() => setSideBarOpen(false)}
        />
      )}
    </div>
  ) : (
    <Loading />
  );
};

export default Layout;
