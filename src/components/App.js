import { Fragment, useEffect, useRef, useState } from "react";
import StarsRating from "./StarsRating";
import { useFetch } from "./useFetch";
import { useLocalStorageState } from "./useLocalStorageState";
import { useKey } from "./useKey";



const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const key = "32d1151f";

export default function App() {

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const {movies,isLoading,error} = useFetch(key,query)
  const [watched,setWatched] = useLocalStorageState([],"watched")

  // Handler
  function handleSelectedId(id) {
    setSelectedId((curr) => (id === curr ? null : id));
  }

  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAdd(watchedMovie) {
    setWatched((curr) => [...curr, watchedMovie]);
    handleCloseMovie();
  }

  function handleRemove(id) {
    const newWatchedMovies = watched.filter((movie) => movie.imdbID !== id);
    setWatched(newWatchedMovies);
  }

  return (
    <>
      <Navbar>
        <Input query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </Navbar>
      <Main>
        <div className="box">
          {isLoading && <Loader />}
          {error && !isLoading && <ErrorMsg message={error} />}
          {!error && !isLoading && (
            <ListBox onSelect={handleSelectedId} movies={movies} />
          )}
        </div>
        <WatchedBox>
          {!selectedId ? (
            <>
              <Summary watched={watched} />
              <WatchedList watched={watched} handleRemove={handleRemove} />
            </>
          ) : (
            <MovieDetails
              key={selectedId}
              watched={watched}
              onClick={handleCloseMovie}
              onAddWatchedMovie={handleAdd}
              movieId={selectedId}
            />
          )}
        </WatchedBox>
      </Main>
    </>
  );
}

function ErrorMsg({ message }) {
  return <p className="center">⛔ {message}</p>;
}

function Loader() {
  return <p className="center">Loading...</p>;
}

function Navbar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Input({ query, setQuery }) {

  const inputRef = useRef()

  useEffect(()=> {
    inputRef.current.focus()
  },[])



  useKey("Enter",()=> {
    if (document.activeElement === inputRef.current) return;
        inputRef.current.focus()
        setQuery("")
  })

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputRef}
    />
  );
}

function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function ListBox({ movies, onSelect }) {
  const [isOpen1, setIsOpen1] = useState(true);

  return (
    <>
      <Button isOpen={isOpen1} setIsOpen={setIsOpen1} />
      {isOpen1 && (
        <ul className="list list-movies">
          {movies?.map((movie) => (
            <MovieList movie={movie} onSelect={onSelect} key={movie.imdbID} />
          ))}
        </ul>
      )}
    </>
  );
}

function MovieList({ movie, onSelect }) {
  return (
    <li onClick={() => onSelect(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ movieId, onClick, onAddWatchedMovie, watched }) {
  const [movie, setMovieDetails] = useState({});
  const [isLoading, setMovieLoading] = useState(false);
  const [movieError, setMovieError] = useState("");
  const [userRating, setRating] = useState("");

  const isWatched = watched?.map((movie) => movie.imdbID).includes(movieId);
  const watchedMovieRating = watched.find(
    (movie) => movie.imdbID === movieId
  )?.userRating;

  const countRating = useRef(0)


  function handleUserRating(value) {
    setRating(value)
  }

  useEffect(()=> {
    if (userRating) countRating.current++ 
  },[userRating])
  
  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,

  } = movie;

  function handleAddMovieDetails() {
    const newMovieWatched = {
      imdbID: movieId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      userRating,
      countUserRating: countRating.current,
    };
    onAddWatchedMovie(newMovieWatched);
  }

  useEffect(() => {
    async function fetchDetails() {
      try {
        setMovieLoading(true);
        setMovieError("");
        const res = await fetch(
          `http://www.omdbapi.com/?apikey=${key}&i=${movieId}`
        );

        if (!res.ok) throw new Error("❌ Faild To Fetch Data");

        const data = await res.json();

        if (data.Response === `False`)
          throw new Error("Details Of Movies Not Found");

        setMovieDetails(data);
      } catch (err) {
        setMovieError(err.message);
      } finally {
        setMovieLoading(false);
      }
    }
    fetchDetails();
  }, [movieId]);

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      return () => (document.title = `usePopcorn`);
    },
    [title]
  );


useKey("Escape",onClick)

  return (
    <div className="details">
      {isLoading && <Loader />}
      {movieError && <ErrorMsg message={movieError} />}
      {!movieError && !isLoading && (
        <>
          <header>
            <button className="btn-back" onClick={onClick}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐️</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarsRating
                    maxRating={10}
                    size={24}
                    onSetRating={handleUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAddMovieDetails}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated with movie {watchedMovieRating} <span>⭐️</span>
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function Button({ setIsOpen, isOpen }) {
  return (
    <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
      {isOpen ? "–" : "+"}
    </button>
  );
}

function WatchedBox({ children }) {
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <Button isOpen={isOpen2} setIsOpen={setIsOpen2} />
      {isOpen2 && children}
    </div>
  );
}

function Summary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedList({ watched, handleRemove }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <ListsOfWatched
          key={movie.imdbID}
          movie={movie}
          handleRemove={handleRemove}
        />
      ))}
    </ul>
  );
}

function ListsOfWatched({ movie, handleRemove }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => handleRemove(movie.imdbID)}
        >
          x
        </button>
      </div>
    </li>
  );
}
