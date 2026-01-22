import "./App.css";
import { Navbar } from "./components/navbar";
import { Routes, Route, useParams } from "react-router";
import { UserProvider } from "./contexts/UserContext";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";

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
    <UserProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/:category/:id" element={<Page />} />
        <Route path="*" element={<Home></Home>} />
      </Routes>
    </UserProvider>
  );
}

export default App;
