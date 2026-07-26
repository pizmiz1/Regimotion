const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const AccountPage = async () => {
  await delay(2000);

  return <h1>Account Page!</h1>;
};

export default AccountPage;
