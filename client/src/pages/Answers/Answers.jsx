import React from 'react';
import ThemeProviderComponent from '../../context/ThemeProviderComponent';
import Navbar from '../../components/Home_Sections/Navbar/nav';
import Header from '../../components/Answers/header';
import AnswerList from '../../components/Answers/AnswerList';
import Footer from '../../components/Home_Sections/Footer/Footer';

const Answer = () => {
    return (
        <ThemeProviderComponent>
            <Navbar />
            <Header />
            <AnswerList />
            <Footer bgColor="#00008b" />
        </ThemeProviderComponent>
    );
};

export default Answer;