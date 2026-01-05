import { useState } from "react";
import { useMessageInputContext } from "stream-chat-react";
import {
  Plus,
  Image,
  Video,
  FileText,
  ImagePlay,
} from "lucide-react";

export const ChatPlusMenu = () => {
  const [open, setOpen] = useState(false);

  const {
    openFileDialog,
    appendText,
  } = useMessageInputContext();

  const toggleMenu = (e) => {
    e.preventDefault();     // 🔑
    e.stopPropagation();    // 🔑
    setOpen((v) => !v);
  };

  const action = (e, fn) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    fn();
  };

  return (
    <div className="relative">
      {/* PLUS BUTTON */}
      <button
        type="button"                // 🔑 VERY IMPORTANT
        onClick={toggleMenu}
        className="p-2 rounded-full hover:bg-secondary/50"
      >
        <Plus className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute bottom-12 left-0 z-50 w-48 rounded-xl border border-primary bg-primary shadow-lg p-2">
          <MenuItem
            icon={<Image />}
            label="Photo"
            onClick={(e) =>
              action(e, () =>
                openFileDialog({ accept: "image/*" })
              )
            }
          />

          <MenuItem
            icon={<Video />}
            label="Video"
            onClick={(e) =>
              action(e, () =>
                openFileDialog({ accept: "video/*" })
              )
            }
          />

          <MenuItem
            icon={<FileText />}
            label="File"
            onClick={(e) =>
              action(e, () =>
                openFileDialog()
              )
            }
          />

          <MenuItem
            icon={<ImagePlay />}
            label="GIF"
            onClick={(e) =>
              action(e, () =>
                appendText("/giphy ")
              )
            }
          />
        </div>
      )}
    </div>
  );
};

const MenuItem = ({ icon, label, onClick }) => (
  <button
    type="button"      // 🔑
    onClick={onClick}
    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-secondary/50"
  >
    <span className="w-5 h-5">{icon}</span>
    {label}
  </button>
);
