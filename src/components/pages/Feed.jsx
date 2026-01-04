import React, { useState, useEffect, useCallback } from "react";
import { assets } from "../../assets/assets";
import Loading from "../Loading";
import StoriesBar from "../StoriesBar";
import PostCard from "../PostCard";
import RecentMessages from "../RecentMessages";
import { useApp } from "../AppContext";
import toast from "react-hot-toast";

const Feed = () => {
  const [feeds, setFeeds] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const { getPosts } = useApp();

  const fetchFeeds = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);

      const data = await getPosts(cursor);

      if (data?.posts?.length) {
        setFeeds((prev) => [...prev, ...data.posts]);
        setCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [cursor, hasMore, loading, getPosts]);

  // Initial load
  useEffect(() => {
    fetchFeeds();
  }, []);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 300
      ) {
        fetchFeeds();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchFeeds]);

  return (
    <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8 border-indigo-300 bg-gradient-to-b from-secondary to-primary">
      {/* Stories and List of Posts */}
      <div>
        <StoriesBar />
        <div className="p-4 space-y-6">
          {feeds.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}

          {loading && <Loading />}
          {!hasMore && (
            <p className="text-center text-tertiary text-sm">No more posts</p>
          )}
        </div>
      </div>

      {/* Right sidebar */}
      <div className="max-xl:hidden sticky top-0">
        <div className="max-w-xs bg-primary text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow">
          <h3 className="text-primary font-semibold">Sponsored</h3>
          <img
            src={assets.sponsored_img}
            alt=""
            className="w-75 h-50 rounded-md"
          />
          <p className="text-secondary">Email Marketing.</p>
          <p className="text-tertiary">
            Supercharge your marketing with a powerful, easy-to-use platform
            built for results.
          </p>
        </div>

        <h1 className="text-primary">Recent Messages</h1>
        <RecentMessages />
      </div>
    </div>
  );
};

export default Feed;
