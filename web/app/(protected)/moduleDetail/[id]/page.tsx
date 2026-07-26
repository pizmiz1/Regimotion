import { ModuleDto } from "../../../../../shared/moduledto";
import { cookies } from "next/headers";
import { cookieKeys } from "@/constants/cookieKeys";
import { dataTags } from "@/constants/dataTags";
import { get } from "@/lib/helpers/fetch";
import { notFound } from "next/navigation";
import BackButton from "@/components/shared/back-button";
import Content from "@/components/moduleDetail/content";

const getModules = async (): Promise<ModuleDto[]> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(cookieKeys.accessToken)?.value;

  const response = await get("/module", accessToken!, dataTags.modules);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data;
};

interface ModuleDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

const ModuleDetailPage = async ({ params }: ModuleDetailPageProps) => {
  const { id } = await params;
  const modules = await getModules();
  const module = modules.find((x) => x.id === id);

  // For Skeleton Loading Testing
  // await new Promise((resolve) => setTimeout(resolve, 3000));

  if (!module) {
    notFound();
  }

  return (
    <>
      <BackButton />

      <Content module={module} />
    </>
  );
};

export default ModuleDetailPage;
