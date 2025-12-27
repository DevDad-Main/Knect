import { useApp } from "../components/AppContext";

export const useCurrentUser = () => {
  const { user } = useApp();
  return user;
};

