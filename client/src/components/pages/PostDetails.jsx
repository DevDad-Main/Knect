import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Comment from "../Comment";
import { ArrowLeft } from "lucide-react";
import { fetchData, updateData } from "../utils";
import PostCard from "../PostCard";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import Loading from "../Loading";

export default function PostDetails() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await fetchData(`api/v1/post/post/${postId}`);
        if (data) {
          setPost(data.post);

          // Only top-level comments
          const topLevelComments = data.comments
            .filter((c) => c.parent === null)
            .map((c) => ({ ...c, replies: c.replies || [] }));
          setComments(topLevelComments);

          console.log(comments);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchPost();
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const data = await updateData(`api/v1/comment/add-comment`, {
        postId,
        content: newComment,
      });
      if (data) {
        setComments([data.comment, ...comments]);
        setNewComment("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddReply = async (parentId, replyText) => {
    try {
      const data = await updateData(`api/v1/comment/add-reply`, {
        postId,
        parentId,
        content: replyText,
      });

      if (data) {
        const insertReply = (commentsArray) =>
          commentsArray.map((c) => {
            if (c._id === parentId) {
              return { ...c, replies: [data.comment, ...(c.replies || [])] };
            } else if (c.replies?.length) {
              return { ...c, replies: insertReply(c.replies) };
            }
            return c;
          });

        setComments(insertReply(comments));
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!post) return <Loading />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-5 w-5 mr-1" />
        Back
      </button>

      {/* Post */}
      <PostCard post={post} />

      {/* Add Comment */}
      <div className="flex items-center gap-3 border-t pt-4">
        <img
          src={currentUser?.profile_picture || "/default-avatar.png"}
          alt="me"
          className="w-9 h-9 rounded-full object-cover"
        />
        <input
          type="text"
          placeholder="Write a comment..."
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          onClick={handleAddComment}
          className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700"
        >
          Post
        </button>
      </div>

      {/* Comments */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-sm">No comments yet.</p>
        ) : (
          comments.map((c) => (
            <Comment key={c._id} comment={c} onReply={handleAddReply} />
          ))
        )}
      </div>
    </div>
  );
}
