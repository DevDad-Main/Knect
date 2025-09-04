import { Toaster } from "react-hot-toast";
import { useRef, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router";

export const App = () => {
  // const navigate = useNavigate();
  // if (!sessionStorage.getItem("token")) {
  //   navigate("/login");
  // }
  useEffect(() => {});
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Toaster />
      <Outlet />
    </div>
  );
};

export default App;
