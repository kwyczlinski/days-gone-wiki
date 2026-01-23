import "./App.css";
import { Navbar } from "./components/navbar";
import { Routes, Route, useParams, Link } from "react-router";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { useState, useEffect } from "react";

const VITE_API_URL = import.meta.env.VITE_API_URL;

const Home = () => {
  return <Navbar />;
};

const DetailsPage = () => {
  const { category, id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleShowDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${VITE_API_URL}/${category}/${id}`);
        if (!res.ok) throw new Error("Not found");
        const result = await res.json();
        setData(result);
      } catch (err) {
        console.error("Fetch error:", err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    handleShowDetails();
  }, [category, id]);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>Item not found.</p>;

  return (
    <div>
      <Navbar />
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      {data.region_id && data.region_name && (
        <p>
          Region:{" "}
          <Link to={`/region/${data.region_id}`}>{data.region_name}</Link>
        </p>
      )}
    </div>
  );
};

const CategoryPage = () => {
  return <div>todo</div>;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/:category" element={<CategoryPage />} />
      <Route path="/:category/:id" element={<DetailsPage />} />
      <Route path="*" element={<Home></Home>} />
    </Routes>
  );
}

export default App;
