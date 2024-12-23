import React, { useState } from 'react'
import Navbar from '../../components/Home_Sections/Navbar/nav';
import ThemeProviderComponent from '../../context/ThemeProviderComponent';
import Header from '../../components/Questions/header';
import QuestionList from '../../components/Questions/QuestionList';
import Footer from '../../components/Home_Sections/Footer/Footer';

const Questions = () => {
  const [selectedFilter, setSelectedFilter] = useState("Newest");

  const [filterOptions, setFilterOptions] = useState({
    sortBy: "",
    unansweredOnly: false,
    unvotedOnly: false,
    searchQuery: "",
  });

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
  }

  return (
    <ThemeProviderComponent>
        <Navbar />
        <Header onFilterChange={handleFilterChange} setFilterOptions={setFilterOptions}/>
        <QuestionList selectedFilter={selectedFilter} filterOptions={filterOptions} />
        <Footer bgColor="#00008b" />
    </ThemeProviderComponent>
  )
}

export default Questions
