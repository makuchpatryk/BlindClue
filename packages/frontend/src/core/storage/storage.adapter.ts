export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class LocalStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    if (typeof localStorage === "undefined") return null;
    return localStorage.getItem(key);
  }

  setItem(key: string, value: string): void {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, value);
  }

  removeItem(key: string): void {
    if (typeof localStorage === "undefined") return;
    localStorage.removeItem(key);
  }
}

let storageAdapter: StorageAdapter = new LocalStorageAdapter();

export function getStorageAdapter(): StorageAdapter {
  return storageAdapter;
}

export function setStorageAdapter(adapter: StorageAdapter): void {
  storageAdapter = adapter;
}
