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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Discover Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Discover People!
          </h1>
          <p className="text-slate-600">
            Connect with amazing people and grow your network!
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 shadow-md rounded-md border border-slate-200/60 bg-white/80">
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search people by name, username, bio or location..."
                className="pl-10 sm:pl-12 py-2 w-full border border-gray-300 rounded-md max-sm:text-sm"
                onChange={(e) => setInput(e.target.value)}
                value={input}
                onKeyUp={handleSearch}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-6">
          {users.length > 0 ? (
            users.map((user) => (
              <UserCard user={user} key={user._id} />
            ))
          ) : (
            !loading && input && (
              <div className="w-full text-center py-12">
                <p className="text-gray-500 text-lg">No users found matching your search criteria.</p>
                <p className="text-gray-400 text-sm mt-2">Try searching with different keywords.</p>
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
