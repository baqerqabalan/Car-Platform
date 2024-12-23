import React from 'react'
import ThemeProviderComponent from '../context/ThemeProviderComponent'
import MessagesList from '../components/Messages/MessagesList'

const Messages = () => {
  return (
    <ThemeProviderComponent>
        <MessagesList/>
    </ThemeProviderComponent>
  )
}

export default Messages
