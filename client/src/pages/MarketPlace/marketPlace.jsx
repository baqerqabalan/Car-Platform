import React, { useState } from "react";
import ThemeProviderComponent from "../../context/ThemeProviderComponent";
import Navbar from "../../components/Home_Sections/Navbar/nav";
import Header from "../../components/MarketPlace/header";
import MarketPlaceList from "../../components/MarketPlace/MarketPlaceList";
import Footer from "../../components/Home_Sections/Footer/Footer";

const MarketPlace = () => {
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [sortOption, setSortOption] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleFilterChange = (filter) => setSelectedFilter(filter);
  const handleSortChange = (sort) => setSortOption(sort);
  const handleSearch = (searchTerm) => setSearchQuery(searchTerm);

  return (
    <ThemeProviderComponent>
      <Navbar />
      <Header
        onFilterChange={handleFilterChange}
        setSortOption={handleSortChange}
        onSearch={handleSearch}
      />
      <MarketPlaceList
        selectedFilter={selectedFilter}
        sortOption={sortOption}
        searchQuery={searchQuery}
      />
      <Footer bgColor="#00008b" />
    </ThemeProviderComponent>
  );
};

export default MarketPlace;