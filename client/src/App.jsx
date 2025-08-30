import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router-dom";

export const App = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <Toaster />
      <Outlet />
    </div>
  );
};

export default App;
