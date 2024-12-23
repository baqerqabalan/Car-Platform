import React, { useState } from 'react';
import ThemeProviderComponent from '../context/ThemeProviderComponent';
import Header from '../components/Sales/Header';
import NormalSalesList from '../components/Sales/NormalSalesList';
import AuctionSalesList from '../components/Sales/AuctionSalesList';

const Sales = () => {
  // State for tab value
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOption, setFilterOption] = useState("");

  // Handler for changing tabs
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if(searchTerm) setSearchTerm("");
    if(filterOption) setFilterOption("");
  };

  // Handle search term from Header
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Handle filter option from Header
  const handleFilterChange = (filter) => {
    setFilterOption(filter);
  };

  return (
    <ThemeProviderComponent>
      <Header
        tabValue={tabValue}
        onTabChange={handleTabChange}
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
      />
      {tabValue === 1 ? (
        <NormalSalesList searchTerm={searchTerm} filterOption={filterOption} />
      ) : (
        <AuctionSalesList searchTerm={searchTerm} filterOption={filterOption} />
      )}
    </ThemeProviderComponent>
  );
};

export default Sales;