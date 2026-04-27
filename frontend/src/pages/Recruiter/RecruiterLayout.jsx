import RecruiterNavbar from "./RecruiterNavbar";
import Footer from "../Footer";
import React from "react";
import { Outlet } from "react-router-dom";
function RecruiterLayout(){
    return(
        <>
        <RecruiterNavbar/>
        <Outlet/>
        <Footer/>
        </>
    )
}

export default RecruiterLayout;