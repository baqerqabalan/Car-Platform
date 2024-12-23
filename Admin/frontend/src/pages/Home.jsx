import React from 'react'
import Header from '../components/Dashboard/Header';
import ThemeProviderComponent from '../context/ThemeProviderComponent';
import Widget from '../components/Dashboard/Widget'

const Home = () => {
  return (
    <ThemeProviderComponent>
    <Header />
    <Widget />
    </ThemeProviderComponent>
  )
}

export default Home
