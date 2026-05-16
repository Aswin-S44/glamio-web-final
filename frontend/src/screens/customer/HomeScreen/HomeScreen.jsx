import React from "react";
import "./HomeScreen.css";
import Banner     from "../../../components/Banner/Banner";
import Header     from "../../../components/Header/Header";
import Footer     from "../../../components/Footer/Footer";
import Parlors    from "../../../sections/Parlors/Parlors";
import WhyChooseUs from "../../../sections/whyChooseUs/WhyChooseUs";
import Stats      from "../../../sections/Stats/Stats";
import GlamCTA    from "../../../sections/GlamCTA/GlamCTA";
import GlamCTA2    from "../../../sections/GlamCTA2/GlamCTA";
import FAQ        from "../../../sections/FAQ/FAQ";

function HomeScreen() {
  return (
    <div>
      <Header />
      <Banner />
      <Parlors />
       <GlamCTA />
      <WhyChooseUs />
      {/* <Stats /> */}
     <GlamCTA2 />
      <FAQ />
      <Footer />
    </div>
  );
}

export default HomeScreen;
