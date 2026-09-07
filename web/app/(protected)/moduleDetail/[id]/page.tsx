import { notFound } from "next/navigation";
import BackButton from "@/components/shared/back-button";
import Content from "@/components/moduleDetail/content";
import { getModules, getUserSettings } from "@/lib/helpers/common-fetch";

interface ModuleDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ prev: string }>;
}

const ModuleDetailPage = async ({ params, searchParams }: ModuleDetailPageProps) => {
  const { id } = await params;
  const { prev } = await searchParams;
  const modules = await getModules();
  const userSettings = await getUserSettings();
  const module = modules.find((x) => x.id === id);

  if (!module) {
    notFound();
  }

  return (
    <>
      <BackButton prev={prev} />

      <Content module={module} userSettings={userSettings} />
    </>
  );
};

export default ModuleDetailPage;
