import "./App.css";
import { Navbar } from "./components/navbar";
import { Routes, Route } from "react-router";
import { DetailsPage } from "./pages/category/details/DetailsPage";
import { EditProfilePage } from "./pages/auth/EditProfilePage";

const Home = () => {
  return (
    <div>
      <Navbar />
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<EditProfilePage />} />
      <Route path="/:category/:id" element={<DetailsPage />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default App;