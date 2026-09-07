import Content from "@/components/account/content";
import { getUserSettings } from "@/lib/helpers/common-fetch";

const AccountPage = async () => {
  const userSettings = await getUserSettings();

  return <Content userSettings={userSettings} />;
};

export default AccountPage;
