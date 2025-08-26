import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { dummyUserData, dummyPostsData } from "../assets/assets";
import Loading from "../Loading";

const Profile = () => {
  const { profileId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [showEdit, setShowEdit] = useState(false);

  const fetchUser = async () => {
    setUser(dummyUserData);
    setPosts(dummyPostsData);
  };

  // Whenever comp gets loaded we will fetch the users
  useEffect(() => {
    fetchUser();
  }, []);

  return user ? <div></div> : <Loading />;
};

export default Profile;
