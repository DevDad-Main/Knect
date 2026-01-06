import React, { useState, useEffect } from "react";
import { Search, UserPlus } from "lucide-react";
import UserCard from "../UserCard";
import Loading from "../Loading";
import { fetchData, updateData } from "../utils";
import toast from "react-hot-toast";

const Discover = () => {
  const [input, setInput] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    if (e.key === "Enter" && input.trim()) {
      try {
        setUsers([]);
        setLoading(true);
        const data = await fetchData(`v1/auth/search?query=${encodeURIComponent(input.trim())}`);
        // const data = await updateData(`v1/search/all`, { nothing: "Hello" });

        console.log("Search results:", data);
        if (data) {
          setUsers(data);
        } else {
          // Handle empty results
          setUsers([]);
          toast.error("No users found matching your search");
        }
        setInput("");
      } catch (error) {
        toast.error("Search failed: " + error.message);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-primary">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-4 lg:py-6">
        {/* Discover Title */}
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-2">
            Discover People!
          </h1>
          <p className="text-secondary text-sm lg:text-base">
            Connect with amazing people and grow your network!
          </p>
        </div>

        {/* Search */}
        <div className="mb-6 lg:mb-8 shadow-md rounded-md border border-secondary/60 bg-primary/80">
          <div className="p-4 lg:p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tertiary w-5 h-5" />
              <input
                type="text"
                placeholder="Search people by name, username, bio or location..."
                className="pl-10 lg:pl-12 py-3 w-full border border-secondary rounded-md text-sm lg:text-base bg-primary text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => setInput(e.target.value)}
                value={input}
                onKeyUp={handleSearch}
              />
            </div>
            {/* Search hint for mobile/tablet */}
            <p className="text-xs text-tertiary mt-2 text-center lg:hidden">
              Press Enter to search
            </p>
          </div>
        </div>
        <div className="flex flex-col lg:flex-row lg:flex-wrap gap-4 lg:gap-6 justify-center lg:justify-start">
          {users.length > 0 ? (
            users.map((user) => (
              <UserCard user={user} key={user._id} />
            ))
          ) : (
            !loading && input && (
              <div className="w-full text-center py-8 lg:py-12">
                <p className="text-tertiary text-base lg:text-lg">No users found matching your search criteria.</p>
                <p className="text-quaternary text-sm lg:text-base mt-2">Try searching with different keywords.</p>
              </div>
            )
          )}
        </div>
        {loading && <Loading height="60vh" />}
      </div>
    </div>
  );
};

export default Discover;
