import { useEffect, useRef, useState } from 'react';

const DB_NAME = 'cskh-crm';
const DB_VERSION = 1;
const STORE_NAME = 'app-data';

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
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
  });
}

export async function writeData(key, value) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(value, key);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => reject(transaction.error);
  });
}

export function useIndexedDbState(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const [ready, setReady] = useState(false);
  const initialValueRef = useRef(initialValue);

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
    writeData(key, value).catch((error) =>
      console.error(`Không thể lưu IndexedDB (${key}):`, error)
    );
  }, [key, ready, value]);

  return [value, setValue, ready];
}
