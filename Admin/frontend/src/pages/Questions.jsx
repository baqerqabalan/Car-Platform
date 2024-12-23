import React from 'react'
import ThemeProviderComponent from '../context/ThemeProviderComponent'
import Header from '../components/Questions/QuestionsList'

const Questions = () => {
  return (
    <ThemeProviderComponent>
        <Header />
    </ThemeProviderComponent>
  )
}

export default Questions
