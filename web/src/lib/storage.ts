// Safe wrappers for localStorage and sessionStorage to prevent crashes in restricted WebViews (like Instagram)

const isServer = typeof window === "undefined";

const createSafeStorage = (type: "localStorage" | "sessionStorage") => {
    // Fallback in-memory storage if the browser blocks the actual storage
    const fallbackStore: Record<string, string> = {};

    return {
        getItem(key: string): string | null {
            if (isServer) return null;
            try {
                return window[type].getItem(key);
            } catch (e) {
                console.warn(`[safeStorage] Failed to read ${key} from ${type}:`, e);
                return fallbackStore[key] || null;
            }
        },
        setItem(key: string, value: string): void {
            if (isServer) return;
            try {
                window[type].setItem(key, value);
            } catch (e) {
                console.warn(`[safeStorage] Failed to write ${key} to ${type}:`, e);
                fallbackStore[key] = value;
            }
        },
        removeItem(key: string): void {
            if (isServer) return;
            try {
                window[type].removeItem(key);
            } catch (e) {
                console.warn(`[safeStorage] Failed to remove ${key} from ${type}:`, e);
                delete fallbackStore[key];
            }
        },
        clear(): void {
            if (isServer) return;
            try {
                window[type].clear();
            } catch (e) {
                console.warn(`[safeStorage] Failed to clear ${type}:`, e);
                Object.keys(fallbackStore).forEach(key => delete fallbackStore[key]);
            }
        }
    };
};

export const safeLocalStorage = createSafeStorage("localStorage");
export const safeSessionStorage = createSafeStorage("sessionStorage");
