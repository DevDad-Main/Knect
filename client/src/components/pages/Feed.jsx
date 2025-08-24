import React, { useState, useEffect } from "react";
import { dummyPostsData } from "../../assets/assets";
import Loading from "../Loading";

const Feed = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchFeeds = async () => {
    setFeeds(dummyPostsData);
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  return !loading ? (
    <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">
      {/* Stories and List of Posts*/}
      <div>
        <h1>Stories </h1>
        <div className="p-4 space-y-6">List of post here</div>
      </div>

      {/* Right sidebar*/}
      <div></div>
    </div>
  ) : (
    <Loading />
  );
};

export default Feed;
