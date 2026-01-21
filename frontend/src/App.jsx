import "./App.css";
import { Navbar } from "./components/navbar";
import { Routes, Route, useParams } from "react-router";

const Home = () => {
  return <Navbar />;
};

const Page = () => {
  const { category, id } = useParams();

  return (
    <>
      <Navbar />
      <div>
        <p>Welcome to the page for</p>
        <p>
          {category} with id {id}
        </p>
      </div>
    </>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:category/:id" element={<Page />} />
    </Routes>
  );
}

export default App;
