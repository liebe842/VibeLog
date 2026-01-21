import { getMyProjects } from "@/lib/actions/projects";
import { WriteForm } from "@/components/write/write-form";

export default async function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const params = await searchParams;
  const result = await getMyProjects();
  const projects = result.projects || [];

  return <WriteForm projects={projects} initialProjectId={params.project} />;
}
