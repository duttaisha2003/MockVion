import Navbar from "./pages/Navber";
import Footer from "./pages/Footer";
import React from "react";
import { Outlet } from "react-router-dom";
function Layout(){
    return(
        <>
        <Navbar/>
        <Outlet/>
        <Footer/>
        </>
    )
}

export default Layout;