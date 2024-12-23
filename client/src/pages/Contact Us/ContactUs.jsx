import React from 'react'
import ThemeProviderComponent from '../../context/ThemeProviderComponent';
import Navbar from '../../components/Home_Sections/Navbar/nav';
import ContactUsContent from '../../components/Contact Us/ContactUsContent';
import Footer from '../../components/Home_Sections/Footer/Footer';

const ContactUs = () => {
  return (
    <ThemeProviderComponent>
        <Navbar />
        <ContactUsContent />
        <Footer bgColor="#00008b" />
    </ThemeProviderComponent>
  )
}

export default ContactUs
