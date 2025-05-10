"use server"

import SettingsForm from "@/components/form-settings";
import { getUserById } from "@/data/user";

import { currentUser } from "@/lib/auth";


const SettingsPage = async () => {
  const user = await currentUser();
  console.log(user);
  if (!user || !user.id) return null;
  const fullUser = await getUserById(user.id);

  console.log(fullUser);
  return (
        <SettingsForm user={fullUser || undefined} />
  );
};

export default SettingsPage;
