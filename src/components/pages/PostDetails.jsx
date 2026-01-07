import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Comment from "../Comment";
import SimpleComment from "../SimpleComment";
import { ArrowLeft, UserIcon, MessageCircle } from "lucide-react";
import { fetchData, updateData } from "../utils";
import PostCard from "../PostCard";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import Loading from "../Loading";
import { useApp } from "../AppContext";

export default function PostDetails() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const { getPost } = useApp();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showMobileComments, setShowMobileComments] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false
  );

  // Common emojis for quick access
  const commonEmojis = ['❤️', '😂', '🔥', '😍', '👏', '😢', '😮', '🎉', '🙏', '💯', '👍', '👎', '😢', '😡', '🤔', '💭'];

  const addEmoji = (emoji) => {
    setNewComment(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

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

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Prevent body scroll when mobile comments are open
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (showMobileComments) {
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = '0';
        document.body.style.left = '0';
      } else {
        // Restore body scroll
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.top = '';
        document.body.style.left = '';
      }
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      document.body.style.left = '';
    };
  }, [showMobileComments]);



  useEffect(() => {
    const fetchPost = async () => {
      try {
        // const data = await fetchData(`v1/posts/get-post/${postId}`);
        const data = await getPost(postId);

        console.log("Post data received:", data);

        if (data) {
          setPost(data.post);

          // Only top-level comments
          const topLevelComments = data.post.comments
            .filter((c) => c.parent === null)
            .map((c) => ({ ...c, replies: c.replies || [] }));
          setComments(topLevelComments);
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
      const data = await updateData(`v1/comments/add-comment/${postId}`, {
        content: newComment,
      });
      if (data) {
        setComments([data, ...comments]);
        setNewComment("");
        window.dispatchEvent(new Event("refreshNotifications"));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleAddReply = async (parentId, replyText) => {
    try {
      const data = await updateData(`v1/comments/add-reply/${postId}`, {
        parentId,
        content: replyText,
      });
      console.log("Reply data received:", data);

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
        window.dispatchEvent(new Event("refreshNotifications"));
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (!post) return <Loading />;

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-secondary/95 backdrop-blur-sm border-b border-secondary">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-tertiary hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back</span>
          </button>
          {isMobile && (
            <button
              onClick={() => setShowMobileComments(true)}
              className="flex items-center gap-2 text-primary hover:text-indigo-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">{comments.length}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Post */}
        <div className="mb-6">
          <PostCard post={post} />
        </div>

        {/* Desktop comments - Show inline on desktop */}
        {!isMobile && (
          <>
            {/* Comment input */}
            <div className="bg-primary rounded-xl border border-secondary p-4 mb-8 shadow-sm">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  {currentUser?.profile_photo ? (
                    <img
                      onClick={() => navigate(`/profile/${currentUser._id}`)}
                      src={currentUser?.profile_photo}
                      alt="Your avatar"
                      className="w-10 h-10 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    />
                  ) : (
                    <div
                      onClick={() => navigate(`/profile/${currentUser._id}`)}
                      className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center cursor-pointer hover:bg-tertiary/10 transition-colors"
                    >
                      <UserIcon className="w-6 h-6 text-tertiary" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 relative">
                  <textarea
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                    rows={1}
                    className="w-full bg-primary text-primary border border-secondary rounded-lg px-4 py-3 pr-12 placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                  />
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="absolute right-2 top-2 p-2 rounded-lg hover:bg-tertiary/10 transition-colors"
                  >
                    <span className="text-xl">😊</span>
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-primary border border-secondary rounded-xl shadow-lg p-3 z-50">
                      <div className="grid grid-cols-6 gap-2">
                        {commonEmojis.map((emoji, index) => (
                          <button
                            key={index}
                            onClick={() => addEmoji(emoji)}
                            className="p-2 text-xl hover:bg-tertiary/10 rounded-lg transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="flex-shrink-0 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                >
                  Post
                </button>
              </div>
            </div>

            {/* Comments section - Always show regardless of comment count */}
            <div className="space-y-4 pb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-primary">
                  {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                </h2>
                <div className="text-sm text-tertiary">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
              {comments.length > 0 ? (
                comments.map((c) => (
                  <SimpleComment key={c._id} comment={c} onReply={handleAddReply} />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-tertiary" />
                  </div>
                  <h3 className="text-lg font-medium text-primary mb-2">No comments yet</h3>
                  <p className="text-tertiary">Be the first to share your thoughts!</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Mobile placeholder button */}
        {isMobile && (
          <div className="text-center py-8">
            <button
              onClick={() => setShowMobileComments(true)}
              className="relative group mx-auto w-20 h-20 bg-gradient-to-br from-indigo-500/10 to-purple-600/10 dark:from-indigo-500/20 dark:to-purple-600/20 rounded-full border-2 border-indigo-500/30 hover:border-indigo-500/60 transition-all duration-300 hover:scale-110 flex items-center justify-center backdrop-blur-sm"
            >
              {/* Animated ring effect */}
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-pulse"></div>

              {/* Icon with animation */}
              <MessageCircle className="w-8 h-8 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform duration-300 relative z-10" />

              {/* Comment count badge */}
              {comments.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg z-20">
                  {comments.length > 99 ? '99+' : comments.length}
                </span>
              )}
            </button>

            <p className="mt-4 font-medium text-primary text-lg">
              {comments.length === 0 ? 'Start a conversation' :
                comments.length === 1 ? 'Join the discussion' :
                  'Join the discussion'}
            </p>
            <p className="text-tertiary text-sm">
              {comments.length === 0 ? 'Be the first to comment' :
                `${comments.length} ${comments.length === 1 ? 'person has' : 'people have'} commented`}
            </p>
          </div>
        )}
      </div>

      {/* Mobile Comment Modal */}
      {isMobile && (
        <div className={`fixed inset-0 z-50 ${showMobileComments ? 'visible' : 'invisible'}`}>
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${showMobileComments ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setShowMobileComments(false)}
          />

          {/* Bottom Sheet */}
          <div className={`absolute bottom-0 left-0 right-0 bg-primary rounded-t-3xl transition-transform duration-300 ease-out flex flex-col ${showMobileComments ? 'translate-y-0' : 'translate-y-full'}`}
            style={{
              height: '75vh',
              maxHeight: '75vh',
              overflow: 'hidden'
            }}>

            {/* Handle bar */}
            <div className="flex justify-center py-3 flex-shrink-0">
              <div className="w-12 h-1 bg-tertiary/30 rounded-full"></div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 border-b border-secondary flex-shrink-0">
              <h3 className="text-lg font-semibold text-primary">
                {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
              </h3>
              <button
                onClick={() => setShowMobileComments(false)}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-tertiary" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto px-4 py-3 overscroll-contain">
              {comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((c) => (
                    <SimpleComment key={c._id} comment={c} onReply={handleAddReply} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
                    <UserIcon className="w-8 h-8 text-tertiary" />
                  </div>
                  <h3 className="text-lg font-medium text-primary mb-2">No comments yet</h3>
                  <p className="text-tertiary">Be the first to share your thoughts!</p>
                </div>
              )}
            </div>

            {/* Comment Input */}
            <div className="border-t border-secondary px-4 py-3 bg-primary flex-shrink-0">
              <div className="flex gap-3 items-end">
                <div className="flex-shrink-0">
                  {currentUser?.profile_photo ? (
                    <img
                      src={currentUser?.profile_photo}
                      alt="Your avatar"
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-tertiary" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="relative">
                    <textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                      rows={1}
                      className="w-full bg-secondary border border-secondary rounded-lg px-4 py-3 pr-12 text-primary placeholder-tertiary focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
                    />
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute right-2 top-2 p-2 rounded-lg hover:bg-tertiary/10 transition-colors"
                    >
                      <span className="text-xl">😊</span>
                    </button>
                  </div>

                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-primary border border-secondary rounded-xl shadow-lg p-3 z-50">
                      <div className="grid grid-cols-6 gap-2">
                        {commonEmojis.map((emoji, index) => (
                          <button
                            key={index}
                            onClick={() => addEmoji(emoji)}
                            className="p-2 text-xl hover:bg-tertiary/10 rounded-lg transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  className="flex-shrink-0 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
