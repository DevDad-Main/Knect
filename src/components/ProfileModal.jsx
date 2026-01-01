import React, { useState, useEffect } from "react";
import { Pencil, UserIcon } from "lucide-react";
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
      const mediaData = await updateWithFormData("v1/media/upload-user-media", mediaFormData, {}, "PUT");
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
        // Merge with existing media data if no new media was uploaded
        const finalData = {
          ...data,
          // Preserve existing media URLs if they weren't updated
          profile_photo: hasProfilePhoto ? data.profile_photo : user.profile_photo,
          cover_photo: hasCoverPhoto ? data.cover_photo : user.cover_photo,
        };

        console.log("FINAL USER DATA WITH PRESERVED MEDIA", finalData);
        onSaved?.(finalData);
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
    <div className="fixed top-0 bottom-0 left-0 right-0 z-110 h-screen overflow-y-scroll bg-black/50">
      <div className="max-w-2xl sm:py-6 mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Edit Profile
          </h1>

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              toast.promise(handleSaveProfile(e), { loading: "Saving..." });
            }}
          >
            {/* Profile Picture */}
            <div className="flex flex-col items-start gap-3">
              <label
                htmlFor="profile_photo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Profile Picture
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  id="profile_photo"
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  onChange={(e) => {
                    setEditForm({
                      ...editForm,
                      profile_photo: e.target.files[0],
                    });
                  }}
                />
                <div className="group/profile relative">
                  {/* <img */}
                  {/*   src={ */}
                  {/*     editForm.profile_photo */}
                  {/*       ? URL.createObjectURL(editForm.profile_photo) */}
                  {/*       : user?.profile_photo */}
                  {/*   } */}
                  {/*   className="w-24 h-24 rounded-full object-cover" */}
                  {/* /> */}
                  {user?.profile_photo ? (
                    <img
                      src={
                        editForm.profile_photo instanceof File
                          ? URL.createObjectURL(editForm.profile_photo)
                          : editForm.profile_photo || null
                      }
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-24 h-24 rounded-full object-cover" />
                  )}

                  <div className="absolute hidden group-hover/profile:flex top-0 left-0 right-0 bottom-0 bg-black/20 rounded-full items-center justify-center">
                    <Pencil className="w-5 h-5 text-white" />
                  </div>
                </div>
              </label>
            </div>
            {/* Cover Photo */}
            <div className="flex flex-col items-start gap-3">
              <label
                htmlFor="cover_photo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Cover Photo
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  id="cover_photo"
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  onChange={(e) => {
                    setEditForm({
                      ...editForm,
                      cover_photo: e.target.files[0],
                    });
                  }}
                />
                <div className="group/cover relative">
                  <img
                    src={
                      editForm.cover_photo instanceof File
                        ? URL.createObjectURL(editForm.cover_photo)
                        : editForm.cover_photo || null
                    }
                    className="w-80 h-40 rounded-lg bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 object-cover mt-2"
                  />
                  <div className="absolute hidden group-hover/cover:flex top-0 left-0 right-0 bottom-0 bg-black/20 rounded-lg items-center justify-center">
                    <Pencil className="w-5 h-5 text-white" />
                  </div>
                </div>
              </label>
            </div>
            {/* Edit Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                className="w-full p-3 pl-2 border border-gray-200 rounded-lg"
                placeholder="Please enter your full name.."
                onChange={(e) =>
                  setEditForm({ ...editForm, fullName: e.target.value })
                }
                value={editForm.fullName}
              />
            </div>

            {/* Edit Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                className="w-full p-3 pl-2 border border-gray-200 rounded-lg"
                placeholder="Please enter a username.."
                onChange={(e) =>
                  setEditForm({ ...editForm, username: e.target.value })
                }
                value={editForm.username}
              />
            </div>

            {/* Edit Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                rows={3}
                className="w-full p-3 pl-2 border border-gray-200 rounded-lg"
                placeholder="Please enter your bio here.."
                onChange={(e) =>
                  setEditForm({ ...editForm, bio: e.target.value })
                }
                value={editForm.bio}
              />
            </div>

            {/* Edit Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                className="w-full p-3 pl-2 border border-gray-200 rounded-lg"
                placeholder="Please enter your location.."
                onChange={(e) =>
                  setEditForm({ ...editForm, location: e.target.value })
                }
                value={editForm.location}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <button
                type="button"
                onClick={() => setShowEdit(false)}
                className="px-4 py-2 borer border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
