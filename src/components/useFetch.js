import { useEffect,useState } from "react";

export function useFetch(key,query) {
    const [movies, setMovies] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();
    
        async function fetchMovies() {
          try {
            setLoading(true);
            setError("");
    
            const res = await fetch(
              `https://www.omdbapi.com/?apikey=${key}&s=${query}`,
              { signal: controller.signal }
            );
    
            if (!res.ok)
              throw new Error("Something Went Wrong With Fetching Movies");
    
            const data = await res.json();
    
            if (data.Response === "False") throw new Error("Movies not Found");
    
            setError(""); // this rest for abort Error
            setMovies(data.Search);
          } catch (err) {
            if (err.name === "AbortError") return;
            setError(err.message);
          } finally {
            setLoading(false);
          }
        }
    
        if (query.length < 3) {
          setMovies([]);
          setError("");
          return;
        }
        // handleCloseMovie();
        fetchMovies();
        
        return () => controller.abort();
      }, [key,query]);


      return {movies,isLoading,error}
}