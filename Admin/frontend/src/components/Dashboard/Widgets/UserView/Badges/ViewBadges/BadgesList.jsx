import React from 'react'
import ThemeProvider from '../../../../../../context/ThemeProviderComponent'
import Content from './Content'
import Header from './Header'

const BadgesList = () => {
  return (
    <ThemeProvider>
        <Header />
        <Content />
    </ThemeProvider>
  )
}

export default BadgesList
