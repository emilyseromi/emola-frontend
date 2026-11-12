import { User } from './models';

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';
const USER_KEY = 'auth_user';

function read(key: string): string | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
  } catch {
    /* storage unavailable */
  }
}

function remove(key: string): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
  } catch {
    /* storage unavailable */
  }
}

export const authStorage = {
  getAccess: () => read(ACCESS_KEY),
  getRefresh: () => read(REFRESH_KEY),
  getUser: (): User | null => {
    try {
      const raw = read(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },
  setTokens: (access: string, refresh?: string) => {
    write(ACCESS_KEY, access);
    if (refresh) write(REFRESH_KEY, refresh);
  },
  setUser: (user: User) => write(USER_KEY, JSON.stringify(user)),
  clear: () => {
    remove(ACCESS_KEY);
    remove(REFRESH_KEY);
    remove(USER_KEY);
  },
};
