import React, { useState } from 'react'
import ThemeProviderComponent from '../context/ThemeProviderComponent'
import Header from '../components/MechanicProposals/Header'
import ProposalCards from '../components/MechanicProposals/ProposalCards';

const MechanicProposals = () => {
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue); 
    }

  return (
    <ThemeProviderComponent>
        <Header tabValue={tabValue} onTabChange={handleTabChange} />
        <ProposalCards tabValue={tabValue} />
    </ThemeProviderComponent>
  )
}

export default MechanicProposals
