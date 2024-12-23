import React from 'react'
import Navbar from '../../components/Home_Sections/Navbar/nav'
import Slideshow from '../../components/Home_Sections/carSlideShow/slideshow'
import ThemeProviderComponent from '../../context/ThemeProviderComponent'
import Auction from '../../components/Home_Sections/Auctions/Auction'
import Question from '../../components/Home_Sections/Question/Question'
import FAQSection from '../../components/Home_Sections/FAQ/faq'
import Footer from '../../components/Home_Sections/Footer/Footer';

const Home = () => {

  return (
    <ThemeProviderComponent>
      <Navbar />
      <Slideshow />
      <Auction />
      <Question />
      <FAQSection />
      <Footer bgColor="#fff" />
    </ThemeProviderComponent>
  )
}

export default Home
