import React, { useState, useEffect } from "react";
import { assets, dummyPostsData } from "../../assets/assets";
import Loading from "../Loading";
import StoriesBar from "../StoriesBar";
import PostCard from "../PostCard";
import RecentMessages from "../RecentMessages";
import { useAuth } from "@clerk/clerk-react";
import { fetchData } from "../utils";
import toast from "react-hot-toast";

const Feed = () => {
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeeds = async () => {
    try {
      setLoading(true);
      const data = await fetchData("api/v1/post/feed");

      if (data) {
        setFeeds(data);
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.message);
    }
    // setFeeds(dummyPostsData);
  };

  useEffect(() => {
    fetchFeeds();
  }, []);

  return !loading ? (
    <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">
      {/* Stories and List of Posts*/}
      <div>
        <StoriesBar />
        <div className="p-4 space-y-6">
          {feeds.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      </div>

      {/* Right sidebar*/}
      <div className="max-xl:hidden sticky top-0">
        <div className="max-w-xs bg-white text-xs p-4 rounded-md nline-flex flex-col gap-2 shadow">
          <h3 className="text-slate-800 font-semibold">Sponsored</h3>
          <img
            src={assets.sponsored_img}
            alt=""
            className="w-75 h-50 rounded-md"
          />
          <p className="text-slate600">Email Marketing.</p>
          <p className="text-slate-400">
            Supercharge your marketing with a powerful, easy-to-use platform
            built for results.
          </p>
        </div>
        <h1>Recent Messages</h1>
        <RecentMessages />
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default Feed;
