import React from "react";
import "./HomeScreen.css";
import Banner from "../../../components/Banner/Banner";
import Services from "../../../sections/services/Services";
import Parlors from "../../../sections/Parlors/Parlors";
import Header from "../../../components/Header/Header";
import Footer from "../../../components/Footer/Footer";
import WhyChooseUs from "../../../sections/whyChooseUs/WhyChooseUs";
import Stats from "../../../sections/Stats/Stats";
import Testimonials from "../../../sections/Testimonials/Testimonials";
import CTA from "../../../sections/CTA/CTA";
import ParlorList from "../../../components/ParlorListings/ParlorListings";

function HomeScreen() {
  return (
    <div>
      <Header />
      <Banner />

      <WhyChooseUs />
      <Services />
      <Stats />
      <Parlors />
      {/* <Testimonials />
      <CTA /> */}
      <Footer />
    </div>
  );
}

export default HomeScreen;
