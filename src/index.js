import React from "react"
import ReactDOM from "react-dom/client"
import  App  from "./components/App"
import "./index.css"
// import StarsRating from "./components/StarsRating"

const root = ReactDOM.createRoot(document.getElementById("root")).render(<React.StrictMode>
  <App/>
  {/* <StarsRating maxRating={6} /> */}
</React.StrictMode>)