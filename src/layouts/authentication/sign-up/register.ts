import { createUserWithEmailAndPassword } from "firebase/auth";

import { auth } from "FirebaseLogic/firebase";
import { api } from "../apiClient";
import { RegisterUserDto } from "Dtos";

export const register = async (user: RegisterUserDto, password: string) => {
  const result = await createUserWithEmailAndPassword(auth, user.Email, password);
  const idToken = await result.user.getIdToken();
  const registeredUser: RegisterUserDto = {
    ...user,
    Uid: result.user.uid,
  };

  try {
    const response = await api.post<RegisterUserDto, RegisterUserDto>(
      "/user/register",
      registeredUser,
      idToken
    );

    return { idToken, user: response };
  } catch (registerException) {
    console.error("Could not save user", registerException);
    throw registerException;
  }
};
