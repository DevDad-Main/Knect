import {
  ThumbsUp,
  ThumbsDown,
  Reply,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import moment from "moment";

function Comment({ comment, onReply }) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [showReplies, setShowReplies] = useState(false);

  const handleReply = () => {
    if (!replyText.trim()) return;
    onReply(comment._id, replyText);
    setReplyText("");
    setShowReplyInput(false);
  };

  return (
    <div className="flex gap-3">
      {/* Avatar */}
      <img
        src={comment.owner?.profile_picture}
        alt={comment.owner?.full_name}
        className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-100"
      />

      <div className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 flex-1 shadow-sm">
        {/* Author + timestamp */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800">
            {comment.owner?.full_name}
          </p>
          <p className="text-xs text-gray-400">
            {moment(comment.createdAt).fromNow()}
          </p>
        </div>

        {/* Content */}
        <p className="text-sm text-gray-700 mt-1">{comment.content}</p>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-2 text-gray-500">
          <button className="flex items-center gap-1 hover:text-indigo-600">
            <ThumbsUp className="w-4 h-4" />
            <span className="text-xs">{comment.likes || 0}</span>
          </button>
          <button className="flex items-center gap-1 hover:text-rose-600">
            <ThumbsDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="flex items-center gap-1 hover:text-green-600"
          >
            <Reply className="w-4 h-4" />
            <span className="text-xs">Reply</span>
          </button>
        </div>

        {/* Reply Input */}
        {showReplyInput && (
          <div className="flex items-center gap-2 mt-3">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 border rounded-full px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleReply}
              className="text-white bg-indigo-600 px-3 py-1 rounded-full text-sm hover:bg-indigo-700"
            >
              Post
            </button>
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex items-center text-xs text-gray-500 hover:text-gray-700"
            >
              {showReplies ? (
                <>
                  <ChevronUp className="w-3 h-3 mr-1" /> Hide replies
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3 mr-1" /> Show{" "}
                  {comment.replies.length} replies
                </>
              )}
            </button>

            {showReplies && (
              <div className="mt-3 pl-6 border-l-2 border-gray-200 space-y-3">
                {comment.replies.map((reply) => (
                  <Comment key={reply._id} comment={reply} onReply={onReply} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Comment;
