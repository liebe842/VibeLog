"use client";

import { useState } from "react";
import { motion, Reorder } from "framer-motion";
import { addFeature, moveFeature, deleteFeature, reorderFeatures } from "@/lib/actions/projects";
import { useRouter } from "next/navigation";

interface Feature {
  id: string;
  title: string;
  createdAt: string;
}

interface FeatureManagerProps {
  projectId: string;
  initialPlanned: Feature[];
  initialCompleted: Feature[];
  isOwner: boolean;
}

export function FeatureManager({
  projectId,
  initialPlanned,
  initialCompleted,
  isOwner,
}: FeatureManagerProps) {
  const router = useRouter();
  const [plannedFeatures, setPlannedFeatures] = useState<Feature[]>(initialPlanned || []);
  const [completedFeatures, setCompletedFeatures] = useState<Feature[]>(initialCompleted || []);
  const [newPlannedTitle, setNewPlannedTitle] = useState("");
  const [newCompletedTitle, setNewCompletedTitle] = useState("");
  const [draggedItem, setDraggedItem] = useState<{ feature: Feature; from: "planned" | "completed" } | null>(null);

  async function handleAddFeature(type: "planned" | "completed", title: string) {
    if (!title.trim()) return;

    // Optimistic update
    const newFeature: Feature = {
      id: crypto.randomUUID(),
      title,
      createdAt: new Date().toISOString(),
    };

    if (type === "planned") {
      setPlannedFeatures([...plannedFeatures, newFeature]);
      setNewPlannedTitle("");
    } else {
      setCompletedFeatures([...completedFeatures, newFeature]);
      setNewCompletedTitle("");
    }

    const result = await addFeature(projectId, title, type);
    if (result.error) {
      alert(result.error);
      // Revert on error
      router.refresh();
    }
  }

  async function handleMoveFeature(featureId: string, from: "planned" | "completed", to: "planned" | "completed") {
    if (from === to) return;

    // Optimistic update
    const sourceList = from === "planned" ? plannedFeatures : completedFeatures;
    const feature = sourceList.find((f) => f.id === featureId);

    if (!feature) return;

    if (from === "planned") {
      setPlannedFeatures(plannedFeatures.filter((f) => f.id !== featureId));
      setCompletedFeatures([...completedFeatures, feature]);
    } else {
      setCompletedFeatures(completedFeatures.filter((f) => f.id !== featureId));
      setPlannedFeatures([...plannedFeatures, feature]);
    }

    const result = await moveFeature(projectId, featureId, from, to);
    if (result.error) {
      alert(result.error);
      // Revert on error
      router.refresh();
    }
  }

  async function handleDeleteFeature(featureId: string, type: "planned" | "completed") {
    if (!confirm("이 기능을 삭제하시겠습니까?")) return;

    // Optimistic update
    if (type === "planned") {
      setPlannedFeatures(plannedFeatures.filter((f) => f.id !== featureId));
    } else {
      setCompletedFeatures(completedFeatures.filter((f) => f.id !== featureId));
    }

    const result = await deleteFeature(projectId, featureId, type);
    if (result.error) {
      alert(result.error);
      // Revert on error
      router.refresh();
    }
  }

  function handleDragStart(feature: Feature, from: "planned" | "completed") {
    setDraggedItem({ feature, from });
  }

  function handleDragEnd() {
    setDraggedItem(null);
  }

  async function handleDrop(to: "planned" | "completed", e: React.DragEvent) {
    e.preventDefault();
    if (!draggedItem) return;

    await handleMoveFeature(draggedItem.feature.id, draggedItem.from, to);
    setDraggedItem(null);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[#e6edf3] text-lg font-semibold flex items-center gap-2">
          <span className="material-symbols-outlined text-xl">checklist</span>
          기능 관리
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Planned Features */}
        <div
          className={`bg-[#0d1117] border-2 ${draggedItem?.from === "completed" ? "border-[#58a6ff]" : "border-[#30363d]"} rounded-md p-4 transition-colors`}
          onDrop={(e) => handleDrop("planned", e)}
          onDragOver={handleDragOver}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[#8b949e] text-sm font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-base">schedule</span>
              구현 예정 ({plannedFeatures.length})
            </h4>
          </div>

          <div className="space-y-2 mb-3 min-h-[100px]">
            {plannedFeatures.map((feature) => (
              <motion.div
                key={feature.id}
                draggable={isOwner}
                onDragStart={() => handleDragStart(feature, "planned")}
                onDragEnd={handleDragEnd}
                className="bg-[#161b22] border border-[#30363d] rounded px-3 py-2 flex items-center justify-between group hover:border-[#58a6ff] transition-colors"
                whileHover={{ scale: 1.02 }}
                layout
              >
                <div className="flex items-center gap-2 flex-1">
                  {isOwner ? (
                    <button
                      onClick={() => handleMoveFeature(feature.id, "planned", "completed")}
                      className="text-[#8b949e] hover:text-[#3fb950] transition-colors"
                      title="완료로 이동"
                    >
                      <span className="material-symbols-outlined text-base">radio_button_unchecked</span>
                    </button>
                  ) : (
                    <span className="material-symbols-outlined text-[#8b949e] text-base">radio_button_unchecked</span>
                  )}
                  <span className="text-[#e6edf3] text-sm">{feature.title}</span>
                </div>
                {isOwner && (
                  <button
                    onClick={() => handleDeleteFeature(feature.id, "planned")}
                    className="text-[#8b949e] hover:text-[#f85149] p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="삭제"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          {isOwner && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddFeature("planned", newPlannedTitle);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={newPlannedTitle}
                onChange={(e) => setNewPlannedTitle(e.target.value)}
                placeholder="새 기능 추가..."
                className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:border-[#58a6ff] focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-2 rounded text-sm font-medium transition-colors"
              >
                추가
              </button>
            </form>
          )}
        </div>

        {/* Completed Features */}
        <div
          className={`bg-[#0d1117] border-2 ${draggedItem?.from === "planned" ? "border-[#3fb950]" : "border-[#30363d]"} rounded-md p-4 transition-colors`}
          onDrop={(e) => handleDrop("completed", e)}
          onDragOver={handleDragOver}
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-[#8b949e] text-sm font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-base">check_circle</span>
              완료된 기능 ({completedFeatures.length})
            </h4>
          </div>

          <div className="space-y-2 mb-3 min-h-[100px]">
            {completedFeatures.map((feature) => (
              <motion.div
                key={feature.id}
                draggable={isOwner}
                onDragStart={() => handleDragStart(feature, "completed")}
                onDragEnd={handleDragEnd}
                className="bg-[#161b22] border border-[#30363d] rounded px-3 py-2 flex items-center justify-between group hover:border-[#3fb950] transition-colors"
                whileHover={{ scale: 1.02 }}
                layout
              >
                <div className="flex items-center gap-2 flex-1">
                  {isOwner ? (
                    <button
                      onClick={() => handleMoveFeature(feature.id, "completed", "planned")}
                      className="text-[#3fb950] hover:text-[#8b949e] transition-colors"
                      title="예정으로 이동"
                    >
                      <span className="material-symbols-outlined text-base">check_circle</span>
                    </button>
                  ) : (
                    <span className="material-symbols-outlined text-[#3fb950] text-base">check_circle</span>
                  )}
                  <span className="text-[#8b949e] text-sm line-through">{feature.title}</span>
                </div>
                {isOwner && (
                  <button
                    onClick={() => handleDeleteFeature(feature.id, "completed")}
                    className="text-[#8b949e] hover:text-[#f85149] p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="삭제"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                )}
              </motion.div>
            ))}
          </div>

          {isOwner && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddFeature("completed", newCompletedTitle);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={newCompletedTitle}
                onChange={(e) => setNewCompletedTitle(e.target.value)}
                placeholder="완료된 기능 추가..."
                className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-3 py-2 text-sm text-[#e6edf3] placeholder-[#8b949e] focus:border-[#3fb950] focus:outline-none"
              />
              <button
                type="submit"
                className="bg-[#238636] hover:bg-[#2ea043] text-white px-3 py-2 rounded text-sm font-medium transition-colors"
              >
                추가
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
