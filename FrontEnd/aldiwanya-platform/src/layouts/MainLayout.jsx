import { Outlet } from "react-router-dom";

// Components
import Navbar from "../components/common/navbar/Navbar";
import Footer from "../components/common/footer/Footer";

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default MainLayout;