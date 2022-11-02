import { storage } from "./utils";

interface AuthResponse {
    user: User;
    jwt: string;
}

export interface User {
    id: string;
    email: string;
    name?: string;
}

const API_URL = "https://xproid.com/server.php";

export async function handleApiResponse(response:any) {
    const data = await response.json();
    if (response.ok) {
        return data;
    } else {
        return Promise.reject(data);
    }
}

export async function getUserProfile() {
    return await fetch(API_URL, {
        headers: {
            Authorization: storage.getToken()
        }
    }).then(handleApiResponse);
}
export async function getUserKeys(pass:any) {
    let getLogin =   storage.getLogin();
    let getUrl =   storage.getUrl();
    return await fetch(`https://${getUrl}/wp-json/rest_auth/v1/author?` + new URLSearchParams({ login: getLogin, pass: pass }), {
        method: 'POST',
    }).then(handleApiResponse);
}

export async function loginWithEmailAndPassword(data:any): Promise<AuthResponse> {
    return window
        .fetch(`${API_URL}`, {
            method: "POST",
            body: JSON.stringify(data)
        })
        .then(handleApiResponse);
}

export async function registerWithEmailAndPassword(
    data:any
): Promise<AuthResponse> {
    return window
        .fetch(`${API_URL}/auth/register`, {
            method: "POST",
            body: JSON.stringify(data)
        })
        .then(handleApiResponse);
}
