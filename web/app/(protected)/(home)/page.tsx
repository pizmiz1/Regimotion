import CurrentDate from "@/components/home/current-date";
import styles from "./page.module.scss";
import { ModuleDto } from "../../../../shared/moduledto";
import { cookies } from "next/headers";
import { cookieKeys } from "@/constants/cookieKeys";
import { dataTags } from "@/constants/dataTags";
import { get } from "@/lib/helpers/fetch";
import { HomeModule } from "@/components/home/home-module";
import NothingHere from "@/components/shared/nothing-here";
import NothingToday from "@/components/home/nothing-today";

const dayMap: Record<number, keyof ModuleDto["days"]> = {
  0: "sun",
  1: "mon",
  2: "tues",
  3: "wed",
  4: "thur",
  5: "fri",
  6: "sat",
};

const getModules = async (): Promise<ModuleDto[]> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(cookieKeys.accessToken)?.value;

  const response = await get("/module", accessToken!, dataTags.modules);

  if (response.error) {
    throw new Error(response.error);
  }

  return response.data;
};

const HomePage = async () => {
  const modules = await getModules();

  const now = new Date();
  const todayKey = dayMap[now.getDay()];
  const todaysModules = modules.filter((module) => module.days[todayKey]);

  return (
    <>
      <CurrentDate />
      <div className={styles.container}>
        {todaysModules.length > 0 ? (
          <div className={styles.card_container}>
            {todaysModules.map((curr) => {
              return <HomeModule key={curr.id} module={curr} />;
            })}
          </div>
        ) : modules.length === 0 ? (
          <NothingHere />
        ) : (
          <NothingToday />
        )}
      </div>
    </>
  );
};

export default HomePage;
