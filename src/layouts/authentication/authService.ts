import { auth } from "FirebaseLogic/firebase";

export const getAuthToken = async () => {
  await auth.authStateReady();

  const user = auth.currentUser;

  if (!user) {
    throw new Error("User is not authenticated");
  }

  return await user.getIdToken();
};
