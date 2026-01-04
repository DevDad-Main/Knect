import React, { useState, useEffect } from "react";
import { Pencil, UserIcon, X } from "lucide-react";
import { fetchData, updateWithFormData } from "./utils";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useApp } from "./AppContext";

const ProfileModal = ({ setShowEdit, onSaved }) => {
  const navigate = useNavigate();
  const { updateUser } = useApp();
  const [user, setUserData] = useState({});
  const [editForm, setEditForm] = useState({
    username: "",
    bio: "",
    location: "",
    profile_photo: null,
    cover_photo: null,
    fullName: "",
  });

  const fetchUser = async () => {
    try {
      const data = await fetchData(`v1/auth/get-user`);
      if (data) {
        setUserData(data);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const uploadMedia = async (profilePhoto, coverPhoto) => {
    const mediaFormData = new FormData();

    if (profilePhoto) {
      mediaFormData.append("profile_photo", profilePhoto);
      mediaFormData.append("profile_photo_type", "profile");
    }
    if (coverPhoto) {
      mediaFormData.append("cover_photo", coverPhoto);
      mediaFormData.append("cover_photo_type", "cover");
    }

    try {
      // Check if user has existing media to determine HTTP method
      const hasExistingProfilePhoto = user?.profile_photo;
      const hasExistingCoverPhoto = user?.cover_photo;
      
      // If either photo exists, use PUT (update), otherwise use POST (create)
      const method = (hasExistingProfilePhoto && profilePhoto) || (hasExistingCoverPhoto && coverPhoto) ? "PUT" : "POST";
      const endpoint = "v1/media/upload-user-media";
      
      console.log(`Using ${method} method for media upload`);
      console.log(`Existing profile photo: ${!!hasExistingProfilePhoto}, Existing cover photo: ${!!hasExistingCoverPhoto}`);
      
      const mediaData = await updateWithFormData(endpoint, mediaFormData, {}, method);
      return mediaData;
    } catch (error) {
      console.error("Media upload failed:", error);
      throw error;
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    e.persist();

    // Check if we have files to upload
    const hasProfilePhoto = editForm.profile_photo instanceof File;
    const hasCoverPhoto = editForm.cover_photo instanceof File;

    console.log("hasProfilePhoto:", hasProfilePhoto, "hasCoverPhoto:", hasCoverPhoto);
    console.log("editForm:", editForm);

    try {
      let data;

      // First, handle media uploads if there are any
      if (hasProfilePhoto || hasCoverPhoto) {
        console.log("Uploading media to /upload-user-media");
        await uploadMedia(
          hasProfilePhoto ? editForm.profile_photo : null,
          hasCoverPhoto ? editForm.cover_photo : null
        );
      }

      // Then update user data (text fields only)
      const userData = {
        username: editForm.username,
        bio: editForm.bio,
        location: editForm.location,
        fullName: editForm.fullName,
      };

      console.log("Updating user data with /update-user");
      data = await updateUser("v1/auth/update-user", userData, "PUT");

      console.log("UPDATE USER DATA", data);

      if (data) {
        // If media was uploaded, fetch fresh user data to get the new media URLs
        if (hasProfilePhoto || hasCoverPhoto) {
          console.log("Media uploaded, fetching fresh user data...");
          const freshUserData = await fetchData("v1/auth/get-user");
          
          if (freshUserData) {
            // Use the fresh data which includes new media URLs
            const finalData = {
              ...freshUserData,
              // Merge any non-media updates from the text update
              username: data.username || freshUserData.username,
              bio: data.bio || freshUserData.bio,
              location: data.location || freshUserData.location,
              fullName: data.fullName || freshUserData.fullName,
            };
            
            console.log("FINAL USER DATA WITH NEW MEDIA", finalData);
            onSaved?.(finalData);
          } else {
            // Fallback: use the text update data
            onSaved?.(data);
          }
        } else {
          // No media uploaded, use existing logic
          const finalData = {
            ...data,
            // Preserve existing media URLs if they weren't updated
            profile_photo: user.profile_photo,
            cover_photo: user.cover_photo,
          };
          
          console.log("FINAL USER DATA WITH PRESERVED MEDIA", finalData);
          onSaved?.(finalData);
        }
        
        setShowEdit(false);
        // navigate("/");
      }
    } catch (error) {
      toast.error(error.message);
      console.log(error);
    }
  };

  console.log("USER UPDATE DATA", editForm);
  // fetch user once
  useEffect(() => {
    fetchUser();
  }, []);

  // sync editForm when user is fetched
  useEffect(() => {
    if (user) {
      setEditForm({
        username: user.username || "",
        bio: user.bio || "",
        location: user.location || "",
        profile_photo: user.profile_photo || null,
        cover_photo: user.cover_photo || null,
        fullName: user.fullName || "",
      });
    }
  }, [user]);
  // const user = useSelector((state) => state.user.value);

  return (
    <div className="fixed inset-0 z-50 h-screen overflow-y-auto bg-black/50 p-4 sm:p-6">
      <div className="min-h-full flex items-center justify-center">
        <div className="w-full max-w-2xl bg-primary rounded-lg shadow-xl relative">
          {/* Mobile close button */}
          <button
            onClick={() => setShowEdit(false)}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-tertiary hover:bg-quaternary transition-colors sm:hidden"
          >
            <X className="w-5 h-5 text-primary" />
          </button>
          
          {/* Desktop close button */}
          <button
            onClick={() => setShowEdit(false)}
            className="absolute top-4 right-4 z-10 p-1 rounded-full hover:bg-tertiary transition-colors hidden sm:block"
          >
            <X className="w-5 h-5 text-tertiary hover:text-primary" />
          </button>
          
          <div className="p-4 sm:p-6 pt-8 sm:pt-6">
            <h1 className="text-2xl font-bold text-primary mb-6">
              Edit Profile
            </h1>

          <form
            className="space-y-4 sm:space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              toast.promise(handleSaveProfile(e), { loading: "Saving..." });
            }}
          >
            {/* Profile Picture */}
            <div className="flex flex-col items-center sm:items-start gap-3">
              <label
                htmlFor="profile_photo"
                className="block text-sm font-medium text-secondary mb-2 text-center sm:text-left"
              >
                Profile Picture
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  id="profile_photo"
                  className="w-full p-3 border border-secondary rounded-lg"
                  onChange={(e) => {
                    setEditForm({
                      ...editForm,
                      profile_photo: e.target.files[0],
                    });
                  }}
                />
                <div className="group/profile relative cursor-pointer">
                  {user?.profile_photo || editForm.profile_photo instanceof File ? (
                    <img
                      src={
                        editForm.profile_photo instanceof File
                          ? URL.createObjectURL(editForm.profile_photo)
                          : editForm.profile_photo || user?.profile_photo
                      }
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-secondary"
                    />
                  ) : (
                    <UserIcon className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-secondary text-tertiary" />
                  )}

                  <div className="absolute inset-0 bg-black/0 group-hover/profile:bg-black/30 rounded-full items-center justify-center transition-all duration-200 flex opacity-0 group-hover/profile:opacity-100">
                    <Pencil className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
              </label>
            </div>
            {/* Cover Photo */}
            <div className="flex flex-col items-center sm:items-start gap-3">
              <label
                htmlFor="cover_photo"
                className="block text-sm font-medium text-secondary mb-2 text-center sm:text-left"
              >
                Cover Photo
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  id="cover_photo"
                  className="w-full p-3 border border-secondary rounded-lg"
                  onChange={(e) => {
                    setEditForm({
                      ...editForm,
                      cover_photo: e.target.files[0],
                    });
                  }}
                />
                <div className="group/cover relative cursor-pointer w-full max-w-xs sm:max-w-full">
                  <img
                    src={
                      editForm.cover_photo instanceof File
                        ? URL.createObjectURL(editForm.cover_photo)
                        : editForm.cover_photo || user?.cover_photo || "/api/placeholder/400/200"
                    }
                    className="w-full h-32 sm:h-40 rounded-lg bg-gradient-to-r from-secondary to-tertiary object-cover mt-2"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover/cover:bg-black/30 rounded-lg items-center justify-center transition-all duration-200 flex opacity-0 group-hover/cover:opacity-100">
                    <Pencil className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                </div>
              </label>
            </div>
            {/* Form fields container for better mobile layout */}
            <div className="space-y-4 sm:space-y-5">
              {/* Edit Name */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full p-3 pl-2 border border-secondary rounded-lg bg-primary text-primary placeholder-tertiary focus:border-accent-primary focus:outline-none transition-colors"
                  placeholder="Please enter your full name.."
                  onChange={(e) =>
                    setEditForm({ ...editForm, fullName: e.target.value })
                  }
                  value={editForm.fullName}
                />
              </div>

              {/* Edit Username */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Username
                </label>
                <input
                  type="text"
                  className="w-full p-3 pl-2 border border-secondary rounded-lg bg-primary text-primary placeholder-tertiary focus:border-accent-primary focus:outline-none transition-colors"
                  placeholder="Please enter a username.."
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                  value={editForm.username}
                />
              </div>

              {/* Edit Bio */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Bio
                </label>
                <textarea
                  rows={3}
                  className="w-full p-3 pl-2 border border-secondary rounded-lg bg-primary text-primary placeholder-tertiary focus:border-accent-primary focus:outline-none transition-colors resize-none"
                  placeholder="Please enter your bio here.."
                  onChange={(e) =>
                    setEditForm({ ...editForm, bio: e.target.value })
                  }
                  value={editForm.bio}
                />
              </div>

              {/* Edit Location */}
              <div>
                <label className="block text-sm font-medium text-secondary mb-1">
                  Location
                </label>
                <input
                  type="text"
                  className="w-full p-3 pl-2 border border-secondary rounded-lg bg-primary text-primary placeholder-tertiary focus:border-accent-primary focus:outline-none transition-colors"
                  placeholder="Please enter your location.."
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                  value={editForm.location}
                />
              </div>
            </div>

            {/* Buttons - Mobile first approach */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-secondary mt-6">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="px-6 py-3 border border-secondary rounded-lg text-secondary hover:bg-tertiary transition-colors cursor-pointer font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 accent-gradient text-white rounded-lg hover:opacity-90 transition cursor-pointer font-medium sm:order-first"
              >
                Save Changes
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
