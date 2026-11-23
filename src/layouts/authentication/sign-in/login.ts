import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "FirebaseLogic/firebase";
import { api } from "../apiClient";
import { LoginUserDto } from "Dtos";

export interface LoginResult {
  idToken: string;
  uid: string;
  email: string | null;
  user: LoginUserDto;
}

export const login = async (email: string, password: string): Promise<LoginResult> => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const idToken = await result.user.getIdToken();
    const user = await api.post<LoginUserDto, { Email: string }>(
      "/user/login",
      { Email: email },
      idToken
    );

    if (!user || typeof user !== "object" || Object.keys(user).length === 0) {
      throw new Error("User not found");
    }

    return {
      idToken,
      uid: result.user.uid,
      email: result.user.email,
      user,
    };
  } catch (loginException) {
    console.error("Could not sign in", loginException);
    throw loginException;
  }
};
