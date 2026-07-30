import { useEffect, useRef, useState } from 'react';
import { DEFAULT_EMPLOYEES, DEFAULT_SOURCES, DEFAULT_STATUSES } from './crmOptions';

const DB_NAME = 'cskh-crm';
const DB_VERSION = 3;
const STORE_NAME = 'app-data';
const subscribers = new Map();
const DEFAULT_RECORDS = {
  statuses: DEFAULT_STATUSES,
  employees: DEFAULT_EMPLOYEES,
  sources: DEFAULT_SOURCES,
};

function notifySubscribers(key, value, source) {
  subscribers.get(key)?.forEach((listener) => listener(value, source));
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (event.oldVersion > 0 && event.oldVersion < 2) {
        const store = request.transaction.objectStore(STORE_NAME);
        const sourcesRequest = store.get('sources');
        sourcesRequest.onsuccess = () => {
          const sources = sourcesRequest.result;
          if (Array.isArray(sources) && !sources.some((source) => source.name === 'Kiot')) {
            store.put([...sources, {
              id: 4,
              name: 'Kiot',
              desc: 'Khách hàng tại cửa hàng',
            }], 'sources');
        }
      };
      // v3: repair partial installations and add the current option defaults
      // without overwriting user edits already stored in IndexedDB.
      if (event.oldVersion < 3) {
        const store = request.transaction.objectStore(STORE_NAME);
        Object.entries(DEFAULT_RECORDS).forEach(([key, defaults]) => {
          const readRequest = store.get(key);
          readRequest.onsuccess = () => {
            const saved = readRequest.result;
            if (!Array.isArray(saved)) {
              store.put(defaults, key);
              return;
            }
            const knownIds = new Set(saved.map((item) => item?.id));
            const missing = defaults.filter((item) => !knownIds.has(item.id));
            if (missing.length) store.put([...saved, ...missing], key);
          };
        });
      }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function readData(key) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function writeData(key, value, source) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(value, key);
    transaction.oncomplete = () => {
      db.close();
      notifySubscribers(key, value, source);
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function updateData(key, updater, source) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    let nextValue;

    request.onsuccess = () => {
      nextValue = updater(request.result);
      if (nextValue !== undefined) store.put(nextValue, key);
    };
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => {
      db.close();
      notifySubscribers(key, nextValue, source);
      resolve(nextValue);
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export function useIndexedDbState(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const [ready, setReady] = useState(false);
  const initialValueRef = useRef(initialValue);
  const sourceRef = useRef(Symbol(key));
  const externalUpdateRef = useRef(false);

  useEffect(() => {
    const listener = (nextValue, source) => {
      if (source === sourceRef.current) return;
      externalUpdateRef.current = true;
      setValue(nextValue);
      setReady(true);
    };
    const keySubscribers = subscribers.get(key) || new Set();
    keySubscribers.add(listener);
    subscribers.set(key, keySubscribers);
    return () => {
      keySubscribers.delete(listener);
      if (keySubscribers.size === 0) subscribers.delete(key);
    };
  }, [key]);

  useEffect(() => {
    let active = true;

    readData(key)
      .then((savedValue) => {
        if (!active) return;
        if (savedValue === undefined) {
          setValue(initialValueRef.current);
        } else {
          setValue(savedValue);
        }
      })
      .catch((error) => console.error(`Không thể đọc IndexedDB (${key}):`, error))
      .finally(() => {
        if (active) setReady(true);
      });

    return () => {
      active = false;
    };
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    if (externalUpdateRef.current) {
      externalUpdateRef.current = false;
      return;
    }
    writeData(key, value, sourceRef.current).catch((error) =>
      console.error(`Không thể lưu IndexedDB (${key}):`, error)
    );
  }, [key, ready, value]);

  return [value, setValue, ready];
}
