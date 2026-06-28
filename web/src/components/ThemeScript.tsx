"use client";

import { useServerInsertedHTML } from "next/navigation";

export default function ThemeScript() {
  useServerInsertedHTML(() => {
    return (
      <script
        id="theme-strategy"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var storageBlocked = false;
              try {
                var testKey = '__storage_test__';
                window.localStorage.setItem(testKey, testKey);
                window.localStorage.removeItem(testKey);
              } catch (e) {
                storageBlocked = true;
              }

              if (storageBlocked) {
                var createInMemoryStorage = function() {
                  var store = {};
                  return {
                    getItem: function(key) { return store.hasOwnProperty(key) ? store[key] : null; },
                    setItem: function(key, value) { store[key] = String(value); },
                    removeItem: function(key) { delete store[key]; },
                    clear: function() { store = {}; },
                    key: function(index) { return Object.keys(store)[index] || null; },
                    get length() { return Object.keys(store).length; }
                  };
                };
                try {
                  Object.defineProperty(window, 'localStorage', { value: createInMemoryStorage(), configurable: true, writable: true });
                  Object.defineProperty(window, 'sessionStorage', { value: createInMemoryStorage(), configurable: true, writable: true });
                } catch (err) {
                  try {
                    window.localStorage = createInMemoryStorage();
                    window.sessionStorage = createInMemoryStorage();
                  } catch (err2) {}
                }
              }

              try {
                var theme = localStorage.getItem('theme');
                var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches === true;
                if (theme === 'dark' || ((!theme || theme === 'system') && supportDarkMode)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            })();
          `,
        }}
      />
    );
  });

  return null;
}
