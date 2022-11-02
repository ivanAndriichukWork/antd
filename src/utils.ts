export const storage = {
  // @ts-ignore
  getToken: () => JSON.parse(window.localStorage.getItem("token")),
  // @ts-ignore
  getPhone: () => JSON.parse(window.localStorage.getItem("phone")),
  // @ts-ignore
  getLogin: () => JSON.parse(window.localStorage.getItem("login")),
  // @ts-ignore
  getUrl: () => JSON.parse(window.localStorage.getItem("url")),
  setToken: (token: any) =>
    window.localStorage.setItem("token", JSON.stringify(token)),
  setLogin: (login: any) =>
    window.localStorage.setItem("login", JSON.stringify(login)),
  setUrl: (url: any) =>
    window.localStorage.setItem("url", JSON.stringify(url)),
  clearToken: () => window.localStorage.removeItem("token")
};
