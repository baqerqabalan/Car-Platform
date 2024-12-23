import React from 'react'
import ThemeProviderComponent from '../../context/ThemeProviderComponent'
import Navbar from '../../components/Home_Sections/Navbar/nav'
import Footer from '../../components/Home_Sections/Footer/Footer'
import Header from '../../components/Mechanic Proposals/Header'
import MechanicProposalsList from '../../components/Mechanic Proposals/MechanicProposalsList'

const MechanicProposals = () => {
  return (
    <ThemeProviderComponent>
        <Navbar />
        <Header />
        <MechanicProposalsList />
        <Footer bgColor="#00008b" />
    </ThemeProviderComponent>
  )
}

export default MechanicProposals
