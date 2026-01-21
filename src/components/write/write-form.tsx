"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { createPost, uploadImage } from "@/lib/actions/posts";
import { getProjectColor } from "@/lib/project-colors";

interface Project {
  id: string;
  title: string;
  status: string;
  color?: string;
  icon?: string;
}

interface WriteFormProps {
  projects: Project[];
  initialProjectId?: string;
}

export function WriteForm({ projects, initialProjectId }: WriteFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    { id: "Coding", label: "코딩", icon: "code_blocks", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { id: "Study", label: "공부", icon: "menu_book", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    { id: "Debug", label: "디버그", icon: "bug_report", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  ];

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const handleImageSelect = (file: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WebP만 가능)");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("파일 크기는 5MB를 초과할 수 없습니다.");
      return;
    }

    setImageFile(file);
    setError("");

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setUploadedImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Upload image first if selected
      let finalImageUrl = uploadedImageUrl;
      if (imageFile && !uploadedImageUrl) {
        setUploadingImage(true);
        const uploadFormData = new FormData();
        uploadFormData.append("file", imageFile);
        const uploadResult = await uploadImage(uploadFormData);
        setUploadingImage(false);

        if (uploadResult.error) {
          setError(uploadResult.error);
          setLoading(false);
          return;
        }

        finalImageUrl = uploadResult.url!;
        setUploadedImageUrl(finalImageUrl);
      }

      const formData = new FormData(e.currentTarget);
      formData.set("category", selectedCategory);
      if (selectedProjectId) {
        formData.set("project_id", selectedProjectId);
      }
      if (finalImageUrl) {
        formData.set("image_url", finalImageUrl);
      }

      const result = await createPost(formData);

      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else {
        router.push("/");
      }
    } catch (err) {
      setError("게시물 작성에 실패했습니다.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d1117] pb-24">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-[#0d1117] sticky top-0 z-20 backdrop-blur-md bg-opacity-90 border-b border-[#30363d]">
        <button
          onClick={() => router.back()}
          className="flex w-10 h-10 shrink-0 items-center justify-center rounded-full hover:bg-[#161b22] transition-colors text-white"
        >
          <span className="material-symbols-outlined text-[24px]">close</span>
        </button>
        <h1 className="text-lg font-bold tracking-tight text-[#e6edf3]">활동 기록</h1>
        <div className="w-10" />
      </header>

      <motion.form
        onSubmit={handleSubmit}
        className="p-4 md:p-6 lg:p-8 max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Project Selection */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
            프로젝트 <span className="text-[#8b949e]/50">- 선택</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[{ id: "", title: "미분류", icon: "📋", color: "gray" }, ...projects.filter((p) => p.title !== "미분류")].map((project) => {
              const projectColor = getProjectColor(project.color || "gray");
              const isSelected = selectedProjectId === project.id;
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    isSelected
                      ? `${projectColor.border} ${projectColor.bgLight}`
                      : "border-[#30363d] bg-[#161b22] hover:border-[#8b949e]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{project.icon || "📁"}</span>
                    <span className="text-sm font-medium text-[#e6edf3] truncate">{project.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex gap-3">
            {selectedProject && selectedProject.title !== "미분류" && (
              <Link
                href={`/projects/${selectedProjectId}`}
                className="inline-flex items-center gap-1 text-xs text-[#58a6ff] hover:underline"
              >
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                프로젝트 보기
              </Link>
            )}
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-1 text-xs text-[#8b949e] hover:text-[#e6edf3]"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              새 프로젝트 만들기
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
            무엇을 작업했나요?
          </label>
          <textarea
            name="content"
            required
            rows={4}
            placeholder="오늘의 활동을 기록하세요..."
            className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-xl text-[#e6edf3] placeholder:text-[#8b949e]/50 focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] resize-none transition-all"
          />
        </div>

        {/* Category */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
            카테고리
          </label>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                  selectedCategory === cat.id
                    ? `${cat.color} border-current`
                    : "bg-[#161b22] border-[#30363d] text-[#8b949e] hover:border-[#8b949e]"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="material-symbols-outlined text-[24px]">{cat.icon}</span>
                <span className="text-xs font-medium">{cat.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
            소요 시간 (분) <span className="text-[#8b949e]/50">- 선택</span>
          </label>
          <input
            type="number"
            name="duration_min"
            min="0"
            placeholder="45"
            className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-xl text-[#e6edf3] placeholder:text-[#8b949e]/50 focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] transition-all"
          />
        </div>

        {/* Link URL */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
            링크 <span className="text-[#8b949e]/50">- 선택</span>
          </label>
          <input
            type="url"
            name="link_url"
            placeholder="https://github.com/username/repo"
            className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-xl text-[#e6edf3] placeholder:text-[#8b949e]/50 focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] transition-all"
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
            이미지 <span className="text-[#8b949e]/50">- 선택</span>
          </label>

          {!imagePreview ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer ${
                isDragging
                  ? "border-[#2ea043] bg-[#2ea043]/5"
                  : "border-[#30363d] bg-[#161b22] hover:border-[#8b949e]"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="material-symbols-outlined text-[48px] text-[#8b949e]">
                  {isDragging ? "upload" : "add_photo_alternate"}
                </span>
                <div>
                  <p className="text-sm text-[#e6edf3] font-medium mb-1">
                    {isDragging ? "여기에 이미지를 놓으세요" : "이미지를 드래그 앤 드롭하거나 클릭하여 선택"}
                  </p>
                  <p className="text-xs text-[#8b949e]">JPG, PNG, GIF, WebP (최대 5MB)</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="relative rounded-xl overflow-hidden bg-[#161b22] border border-[#30363d]">
              <div className="relative w-full aspect-video">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-contain"
                />
              </div>
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-[#0d1117]/80 hover:bg-[#0d1117] backdrop-blur-sm text-white rounded-full p-2 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
              {uploadingImage && (
                <div className="absolute inset-0 bg-[#0d1117]/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-[32px] text-[#2ea043]">
                      sync
                    </span>
                    <p className="text-sm text-[#e6edf3]">업로드 중...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <motion.div
            className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.div>
        )}

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={loading || !selectedCategory}
          className="w-full bg-gradient-to-r from-[#2ea043] to-[#3fb950] hover:from-[#25b060] hover:to-[#34a94b] disabled:from-[#2ea043]/50 disabled:to-[#3fb950]/50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-[#2ea043]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? (
            <>
              <span className="material-symbols-outlined animate-spin">sync</span>
              기록 중...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">check</span>
              활동 기록하기
            </>
          )}
        </motion.button>
      </motion.form>
    </div>
  );
}
