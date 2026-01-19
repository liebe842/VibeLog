"use client";

import { useState, useRef } from "react";
import { updateProfile, uploadAvatar } from "@/lib/actions/profile";
import { useRouter } from "next/navigation";

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: {
    username: string;
    bio?: string;
    avatar_url?: string;
  };
}

export function ProfileEditModal({ isOpen, onClose, currentProfile }: ProfileEditModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [username, setUsername] = useState(currentProfile.username);
  const [bio, setBio] = useState(currentProfile.bio || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(currentProfile.avatar_url || null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드 가능합니다.");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    setAvatarFile(file);
    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Upload avatar if file is selected
      let newAvatarUrl = currentProfile.avatar_url;
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        const uploadResult = await uploadAvatar(formData);

        if (uploadResult.error) {
          setError(uploadResult.error);
          setIsSubmitting(false);
          return;
        }

        newAvatarUrl = uploadResult.avatar_url;
      }

      // Update profile
      const result = await updateProfile({
        username,
        bio,
        avatar_url: newAvatarUrl,
      });

      setIsSubmitting(false);

      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
        onClose();
      }
    } catch (err) {
      setError("오류가 발생했습니다. 다시 시도해주세요.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#30363d]">
          <h2 className="text-xl font-bold text-[#e6edf3]">프로필 편집</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#21262d] transition-colors text-[#8b949e]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-[#21262d] border-4 border-[#161b22] shadow-xl flex items-center justify-center text-4xl font-bold text-[#e6edf3] overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  username[0]?.toUpperCase() || "U"
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-white text-[32px]">
                  photo_camera
                </span>
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] text-sm font-semibold rounded-lg transition-colors"
            >
              이미지 변경
            </button>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#8b949e]">사용자 이름</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#e6edf3] focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] transition-all"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#8b949e]">자기소개</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="자기소개를 입력하세요..."
              rows={3}
              className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg text-[#e6edf3] placeholder:text-[#8b949e]/50 focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] transition-all resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-[#21262d] hover:bg-[#30363d] text-[#e6edf3] font-semibold rounded-lg transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-[#2ea043] hover:bg-[#2c974b] disabled:bg-[#8b949e]/20 disabled:text-[#8b949e] text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {isSubmitting ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
