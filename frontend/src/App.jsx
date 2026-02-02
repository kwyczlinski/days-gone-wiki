import "./App.css";
import { Navbar } from "./components/navbar";
import { Routes, Route } from "react-router";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { DetailsPage } from "./pages/category/details/DetailsPage";
import { EditProfilePage } from "./pages/auth/EditProfilePage";

const VITE_API_URL = import.meta.env.VITE_API_URL;

const Home = () => {
  return <Navbar />;
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
      <Route path="/profile" element={<EditProfilePage />} />
      <Route path="/:category" element={<CategoryPage />} />
      <Route path="/:category/:id" element={<DetailsPage />} />
      <Route path="*" element={<Home></Home>} />
    </Routes>
  );
}

export default App;
