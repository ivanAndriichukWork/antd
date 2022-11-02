
import { initReactQueryAuth } from "react-query-auth";
import {
  getUserKeys,
  getUserProfile,
  loginWithEmailAndPassword,
  User
} from "../api";
import { storage } from "../utils";
export async function handleUserResponse(data:any) {
  let phone = storage.getPhone();
  let userData = data[phone];
  storage.setUrl(userData.site);
  storage.setLogin(userData.login);
  return userData;
}
async function handleUserKeysResponse(pass:any) {
  const data = await getUserKeys(pass);
  storage.setToken(data);
  return data;
}
async function loadUser() {
  let user = null;
  if (storage.getToken()) {
    // const data = await getUserProfile();
    // user = data;
    const location = {
      pathname: '/products',
    }
    // history.push(location);
  }
  return user;
}

async function loginFn(data:any) {
  window.localStorage.setItem("phone", data.phone);
  const response = await loginWithEmailAndPassword(data);
  const user = await handleUserResponse(response);
  const pass = data.password;
  const keys = await handleUserKeysResponse(pass);
  return keys;
}

async function logoutFn() {
  await storage.clearToken();
}

const authConfig = {
  loadUser,
  loginFn,
  logoutFn
};
// @ts-ignore
const { AuthProvider, useAuth } = initReactQueryAuth<User>(authConfig);

export { AuthProvider, useAuth };
