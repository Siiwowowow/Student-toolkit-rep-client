import { Outlet, useLocation } from "react-router";
import Navbar from "../Components/Navbar/Navbar";
import Footer from "../Components/Footer/Footer";

const Root = () => {
  const isLandingPage = useLocation().pathname === "/";
  if (isLandingPage) return <Outlet />;

  return (
    <div>
      <Navbar></Navbar>
      <div className="min-h-[calc(100vh-278px)]">
        <Outlet></Outlet>
      </div>
      <Footer></Footer>
    </div>
  );
};

export default Root;
