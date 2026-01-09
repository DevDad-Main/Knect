import React, { useState } from "react";
import { Image, UserIcon, X } from "lucide-react";
import toast from "react-hot-toast";
import { updateWithFormData } from "../components/utils";
import { useApp } from "../components/AppContext";

const CreatePostBox = ({ onPostCreated }) => {
  const { user } = useApp();
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!images.length && !content) {
      toast.error("Please add at least one image or write something");
      return;
    }

    const totalSize = images.reduce((sum, image) => sum + image.size, 0);
    const maxSize = 50 * 1024 * 1024;

    if (totalSize > maxSize) {
      toast.error(
        `Total image size exceeds 50MB. Current size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`,
      );
      return;
    }

    setLoading(true);
    const postType =
      images.length && content
        ? "text_with_image"
        : images.length
          ? "image"
          : "text";

    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("postType", postType);
      images.map((image) => {
        formData.append("images", image);
      });

      const data = await updateWithFormData("v1/posts/create-post", formData);

      if (data) {
        setContent("");
        setImages([]);
        toast.success("Post created successfully!");
        if (onPostCreated && data.post) {
          onPostCreated(data.post);
        }
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="bg-primary p-4 rounded-xl shadow-md mb-6 ml-4 mr-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        {user?.profile_photo ? (
          <img
            className="w-10 h-10 rounded-full shadow object-cover"
            src={user?.profile_photo}
            alt=""
          />
        ) : (
          <UserIcon className="w-10 h-10 rounded-full shadow object-cover" />
        )}
        <div>
          <h3 className="font-semibold text-sm">{user?.fullName}</h3>
          <p className="text-xs text-tertiary">@{user?.username}</p>
        </div>
      </div>

      {/* Text Area */}
      <textarea
        className="w-full resize-none max-h-16 text-sm outline-none text-primary placeholder-tertiary bg-transparent mb-3"
        placeholder="What's on your mind?"
        onChange={(e) => setContent(e.target.value)}
        value={content}
      />

      {/* Images */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {images.map((image, i) => (
            <div key={i} className="relative group">
              <img
                src={URL.createObjectURL(image)}
                className="h-16 rounded-md"
                alt=""
              />
              <div
                onClick={() =>
                  setImages(images.filter((_, index) => index !== i))
                }
                className="absolute hidden group-hover:flex justify-center items-center top-0 right-0 bottom-0 left-0 bg-black/40 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4 text-white" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-secondary">
        <label
          htmlFor="feed-images"
          className="flex items-center gap-2 text-sm text-tertiary hover:text-secondary transition cursor-pointer"
        >
          <Image className="size-5" />
        </label>
        <input
          type="file"
          id="feed-images"
          accept="image/*"
          hidden
          multiple
          onChange={(e) => {
            const newImages = Array.from(e.target.files);
            const updatedImages = [...images, ...newImages];

            const totalSize = updatedImages.reduce(
              (sum, image) => sum + image.size,
              0,
            );
            const maxSize = 50 * 1024 * 1024;

            if (totalSize > maxSize) {
              toast.error(
                `Total image size exceeds 50MB. Current size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`,
              );
              return;
            }

            setImages(updatedImages);
          }}
        />
        <button
          disabled={loading}
          onClick={() =>
            toast.promise(handleSubmit(), {
              loading: "Uploading...",
              success: <p>Post Added Successfully</p>,
              error: <p>Post Not Added!</p>,
            })
          }
          className="text-sm accent-gradient hover:opacity-90 active:scale-95 transition text-white font-medium px-6 py-1.5 rounded-md cursor-pointer"
        >
          Post
        </button>
      </div>
    </div>
  );
};

export default CreatePostBox;
