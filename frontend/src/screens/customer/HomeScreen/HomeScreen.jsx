import React from "react";
import "./HomeScreen.css";
import Banner from "../../../components/Banner/Banner";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import WhyChooseUs from "../../../sections/whyChooseUs/WhyChooseUs";
import Stats from "../../../sections/Stats/Stats";
import Parlors from "../../../sections/Parlors/Parlors";
import GlamCTA from "../../../sections/GlamCTA/GlamCTA";

function HomeScreen() {
  return (
    <div>
      <Header />
      <Banner />
      <Parlors />
      <WhyChooseUs />
      <Stats />
      <GlamCTA />
      <Footer />
    </div>
  );
}

export default HomeScreen;
