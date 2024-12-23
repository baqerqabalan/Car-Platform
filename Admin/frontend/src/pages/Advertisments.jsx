import React, { useState } from 'react'
import ThemeProviderComponent from '../context/ThemeProviderComponent'
import AdvertisementsContent from '../components/Advertisements/AdvertisementsContent'
import Header from '../components/Advertisements/Header'
import PublishedAdvertisementContent from '../components/Advertisements/PublishedAdvertisementContent'

const Advertisments = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  }

  return (
    <ThemeProviderComponent>
        <Header onTabChange={handleTabChange} tabValue={tabValue} />
        {tabValue !== 0 ? <AdvertisementsContent tabValue={tabValue} /> : <PublishedAdvertisementContent tabValue={tabValue} />}
    </ThemeProviderComponent>
  )
}

export default Advertisments
