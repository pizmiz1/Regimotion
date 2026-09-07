import CurrentDate from "@/components/home/current-date";
import styles from "./page.module.scss";
import { HomeModule } from "@/components/home/home-module";
import NothingHere from "@/components/shared/nothing-here";
import NothingToday from "@/components/home/nothing-today";
import { dayMap } from "@/constants/maps";
import { getModules, getUserSettings } from "@/lib/helpers/common-fetch";

const HomePage = async () => {
  const modules = await getModules();
  const userSettings = await getUserSettings();

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
              return <HomeModule key={curr.id} module={curr} userSettings={userSettings} />;
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
