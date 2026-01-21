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
  const [aiHelpScore, setAiHelpScore] = useState<number | null>(null);
  const [timeSaved, setTimeSaved] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultContent = `- 오늘 작업한 내용

- AI와 협업하며 느낀 어려움이나 깨달음`;

  const timeSavedOptions = [
    { value: "none", label: "단축되지 않음" },
    { value: "1.5x", label: "약 1.5배" },
    { value: "2x", label: "약 2배" },
    { value: "3x", label: "약 3배 이상" },
    { value: "impossible", label: "직접 코딩으로는 불가능한 수준" },
  ];

  const aiHelpScoreLabels: Record<number, string> = {
    1: "거의 도움 안됨",
    2: "약간 도움됨",
    3: "보통",
    4: "많이 도움됨",
    5: "매우 많이 도움됨",
  };

  const categories = [
    { id: "Planning", label: "기획 및 PRD 작성", icon: "description", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    { id: "Development", label: "핵심 기능 구현", icon: "code_blocks", color: "bg-green-500/20 text-green-400 border-green-500/30" },
    { id: "Design", label: "UI 디자인 및 개선", icon: "palette", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    { id: "Debug", label: "디버깅 및 배포", icon: "bug_report", color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
    { id: "Other", label: "기타", icon: "more_horiz", color: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
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
      if (aiHelpScore !== null) {
        formData.set("ai_help_score", aiHelpScore.toString());
      }
      if (timeSaved) {
        formData.set("time_saved", timeSaved);
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
            프로젝트
          </label>
          <div className="grid grid-cols-2 gap-2">
            {[...projects.filter((p) => p.title !== "미분류"), { id: projects.find((p) => p.title === "미분류")?.id || "", title: "기타", icon: "📋", color: "gray" }].map((project) => {
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
            {selectedProject && selectedProject.title !== "미분류" && selectedProjectId !== projects.find((p) => p.title === "미분류")?.id && (
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

        {/* Category */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
            카테고리
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <motion.button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-2 rounded-lg border flex items-center gap-1.5 transition-all ${
                  selectedCategory === cat.id
                    ? `${cat.color} border-current`
                    : "bg-[#161b22] border-[#30363d] text-[#8b949e] hover:border-[#8b949e]"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="material-symbols-outlined text-[16px]">{cat.icon}</span>
                <span className="text-xs font-medium whitespace-nowrap">{cat.label}</span>
              </motion.button>
            ))}
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
            rows={6}
            defaultValue={defaultContent}
            className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-xl text-[#e6edf3] placeholder:text-[#8b949e]/50 focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] resize-none transition-all"
          />
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
            소요 시간 (분)
          </label>
          <input
            type="number"
            name="duration_min"
            min="1"
            required
            placeholder="45"
            className="w-full px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-xl text-[#e6edf3] placeholder:text-[#8b949e]/50 focus:outline-none focus:border-[#2ea043] focus:ring-1 focus:ring-[#2ea043] transition-all"
          />
        </div>

        {/* AI Help Score */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
            코딩 도우미가 오늘의 작업에 얼마나 도움이 되었나요?
          </label>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setAiHelpScore(aiHelpScore === 0 ? null : 0)}
              className={`px-2 py-1 rounded-lg text-xs transition-all ${
                aiHelpScore === 0
                  ? "bg-[#2ea043]/10 border border-[#2ea043] text-[#2ea043]"
                  : "text-[#8b949e] hover:text-[#e6edf3] border border-transparent"
              }`}
            >
              사용 안함
            </button>
            <span className="text-[#30363d] mx-2">|</span>
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => setAiHelpScore(score)}
                className="p-1 transition-all hover:scale-110"
              >
                <span
                  className={`material-symbols-outlined text-[28px] ${
                    aiHelpScore !== null && aiHelpScore !== 0 && score <= aiHelpScore
                      ? "text-red-500"
                      : "text-[#30363d] hover:text-red-500/50"
                  }`}
                  style={{ fontVariationSettings: aiHelpScore !== null && aiHelpScore !== 0 && score <= aiHelpScore ? "'FILL' 1" : "'FILL' 0" }}
                >
                  favorite
                </span>
              </button>
            ))}
            {aiHelpScore !== null && aiHelpScore !== 0 && (
              <span className="ml-2 text-sm text-[#8b949e]">
                {aiHelpScoreLabels[aiHelpScore]}
              </span>
            )}
          </div>
        </div>

        {/* Time Saved */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">
            오늘 수행한 작업을 AI 없이 직접 코딩했다면 시간이 얼마나 더 걸렸을까요?
          </label>
          <div className="flex flex-col gap-2">
            {timeSavedOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTimeSaved(option.value)}
                className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${
                  timeSaved === option.value
                    ? "bg-[#2ea043]/10 border-[#2ea043] text-[#e6edf3]"
                    : "bg-[#161b22] border-[#30363d] text-[#8b949e] hover:border-[#8b949e]"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
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
          disabled={loading || !selectedCategory || !selectedProjectId || aiHelpScore === null || !timeSaved}
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
