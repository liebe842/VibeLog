import { getProjects } from "@/lib/actions/projects";
import { WriteForm } from "@/components/write/write-form";

export default async function WritePage({
  searchParams,
}: {
  searchParams: Promise<{ project?: string }>;
}) {
  const params = await searchParams;
  const result = await getProjects(100);
  const projects = result.projects || [];

  return <WriteForm projects={projects} initialProjectId={params.project} />;
}
