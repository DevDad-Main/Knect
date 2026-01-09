import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { dummyUserData, dummyPostsData } from "../../assets/assets";

import Loading from "../Loading";
import UserProfileInfo from "../UserProfileInfo";
import ConnectionsModal from "../ConnectionsModal";
import MobileConnectionsModal from "../MobileConnectionsModal";
import moment from "moment";
import PostCard from "../PostCard";
import ProfileModal from "../ProfileModal";
import ImageViewer from "../ImageViewer";
import { useApp } from "../AppContext";
import toast from "react-hot-toast";

const Profile = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, getProfile, loading } = useApp();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [showEdit, setShowEdit] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [viewerImage, setViewerImage] = useState(null);
  const [showConnections, setShowConnections] = useState(false);
  const [connectionsTab, setConnectionsTab] = useState("followers");
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );

  // Handle stat clicks
  const handleStatClick = (stat) => {
    if (stat === 'posts') {
      setActiveTab('posts');
    } else {
      // Convert to proper tab label format
      const tabLabel = stat.charAt(0).toUpperCase() + stat.slice(1);
      setConnectionsTab(tabLabel);
      setShowConnections(true);
    }
  };

  // Fetch profile by ID
  const fetchUser = useCallback(
    async (id) => {
      try {
        if (!id) return; // safeguard
        setProfileLoading(true);
        
        const data = await getProfile(id);

        if (data) {
          setUser(data.user || data.profile);
          setPosts(data.posts || []);
          setLikes(data.likes || []);
        } else {
          // Handle case where data is null/undefined
          
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast.error(error.message);
      } finally {
        setProfileLoading(false);
      }
    },
    [getProfile],
  );

  useEffect(() => {
    // If we have a profileId from URL, use it immediately
    if (profileId) {
      fetchUser(profileId);
    } else if (!loading && currentUser) {
      // Only use currentUser if loading is complete and we have a user
      fetchUser(currentUser._id);
    }
  }, [profileId, loading, currentUser?._id, fetchUser]);

  // Handle responsive design
  useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 1024);
      }
    };

    // Set initial value
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (profileLoading) {
    return <Loading />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-tertiary">No profile data found</p>
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-y-scroll bg-secondary p-4 lg:p-6">
      <div className="max-w-3xl mx-auto">
        
{/* Profile Card */}
        <div className="bg-primary rounded-2xl shadow-lg overflow-hidden">
          {/* Cover Photo */}
          <div 
            className="h-40 md:h-56 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 cursor-pointer relative group"
            onClick={() => user.cover_photo && setViewerImage(user.cover_photo)}
          >
            {user.cover_photo && (
              <>
                <img
                  src={user.cover_photo}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white bg-black/50 rounded-full p-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </>
            )}
          </div>
          {/* User Info */}
          <UserProfileInfo
            user={user}
            posts={posts}
            profileId={profileId}
            setShowEdit={setShowEdit}
            onProfilePhotoClick={() => user.profile_photo && setViewerImage(user.profile_photo)}
            onStatClick={handleStatClick}
            activeTab={activeTab}
          />
        </div>
        
        {/* Tabs */}
        <div className="mt-6">
          <div className="bg-primary rounded-xl shadow-md p-1 flex max-w-md mx-auto">
            {["posts", "media", "likes"].map((tab) => (
              <button
                onClick={() => setActiveTab(tab)}
                key={tab}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${activeTab === tab ? "accent-gradient text-white" : "text-secondary hover:text-primary"}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          {/* Posts */}
          {activeTab === "posts" && (
            <div className="mt-6 flex flex-col items-center gap-6">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
          {/* Media */}
          {activeTab === "media" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
              {posts
                .filter((post) => post.image_urls.length > 0)
                .map((post) => (
                  <>
                    {post.image_urls.map((image, index) => (
                      <Link
                        target="_blank"
                        to={image}
                        key={index}
                        className="relative group overflow-hidden rounded-lg"
                      >
                        <img
                          src={image}
                          key={index}
                          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                          alt=""
                        />
                        <p className="absolute bottom-0 left-0 right-0 text-xs p-2 bg-gradient-to-t from-black/70 to-transparent text-white opacity-0 group-hover:opacity-100 transition duration-300">
                          Posted {moment(post.createdAt).fromNow()}
                        </p>
                      </Link>
                    ))}
                  </>
                ))}
            </div>
          )}
          {/* Likes */}
          {activeTab === "likes" && (
            <div className="mt-6 flex flex-col items-center gap-6">
              {likes.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Edit Profile Modal */}
      {showEdit && (
        <ProfileModal
          setShowEdit={setShowEdit}
          onSaved={(updatedUser) => setUser(updatedUser)}
        />
      )}
      
      {/* Image Viewer Modal */}
      {viewerImage && (
        <ImageViewer 
          imageUrl={viewerImage} 
          onClose={() => setViewerImage(null)} 
        />
      )}
      
      {/* Connections Modal - Desktop */}
      {!isMobile && showConnections && (
        <ConnectionsModal
          isOpen={showConnections}
          onClose={() => setShowConnections(false)}
          userId={user._id}
          initialTab={connectionsTab}
          isOwnProfile={!profileId || profileId === currentUser?._id}
        />
      )}
      
      {/* Connections Modal - Mobile */}
      {isMobile && (
        <MobileConnectionsModal
          isOpen={showConnections}
          onClose={() => setShowConnections(false)}
          userId={user._id}
          initialTab={connectionsTab}
          isOwnProfile={!profileId || profileId === currentUser?._id}
        />
      )}
    </div>
  );
};

export default Profile;
