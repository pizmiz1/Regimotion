import Content from "@/components/account/content";
import { getUserSettings } from "@/lib/helpers/common-fetch";

const AccountPage = async () => {
  const userSettings = await getUserSettings();

  await new Promise((resolve) => {
    setTimeout(resolve, 3000);
  });

  return <Content userSettings={userSettings} />;
};

export default AccountPage;
