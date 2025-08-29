import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MenuItems from "./MenuItems";
import { CirclePlus, LogOut, User } from "lucide-react";
import { fetchData } from "./utils";

const SideBar = ({ sideBarOpen, setSideBarOpen }) => {
  const navigate = useNavigate();

  const [user, setUserData] = useState(null);
  // const user = useSelector((state) => state.user.value);
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
  // const { signOut } = console.log("Sign Out");

  return (
    <div
      className={`w-60 xl:w-72 bg-white border-r border-gray-200 flex flex-col justify-between items-center max-sm:absolute top-0 bottom-0 z-20 ${sideBarOpen ? "translate-x-0" : "max-sm:-translate-x-full"} transition-all duration-300 ease-in-out`}
    >
      <div className="w-full">
        {/* <img */}
        {/*   onClick={() => navigate("/")} */}
        {/*   src={assets.logo} */}
        {/*   className="w-26 ml-7 my-2 cursor-pointer" */}
        {/* /> */}
        <h1
          onClick={() => navigate("/")}
          className="w-26 ml-7 my-2 text-purple-700 text-2xl font-bold"
        >
          Knect
        </h1>
        <hr className="border-gray-300 mb-8" />
        <MenuItems setSideBarOpen={setSideBarOpen} />
        <Link
          to="/create-post"
          className="flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 transition text-white cursor-pointer"
        >
          <CirclePlus className="w-5 h-5" />
          Create Post
        </Link>
      </div>

      <div className="w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between">
        <div className="flex gap-2 items-center curosr-pointer">
          <User />
          <div>
            <h1 className="text-sm font-medium">{user?.full_name}</h1>
            <p className="text-xs text-gray-500">@{user?.username}</p>
          </div>
        </div>
        <LogOut
          onClick={() => console.log("Sign Out")}
          className="w-4.5 text-gray-400 hover:text-gray-700 transition cursor-pointer"
        />
      </div>
    </div>
  );
};

export default SideBar;
