import React from "react";
import Header from "./Header";
import ThemeProvider from "../../../../../context/ThemeProviderComponent";
import BadgesList from "./BadgesList";

const Badges = () => {
  return (
    <ThemeProvider>
      <Header />
      <BadgesList />
    </ThemeProvider>
  );
};

export default Badges;
