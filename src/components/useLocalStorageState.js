import { useEffect,useState } from "react";

export function useLocalStorageState(initialValue,key) {
    const [value, setValue] = useState(() => {
        const newWatchedArr = localStorage.getItem(key);
        return newWatchedArr ? JSON.parse( localStorage.getItem(key)) : initialValue;
      });

      useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
      }, [value,key]);

      return [value,setValue]
}