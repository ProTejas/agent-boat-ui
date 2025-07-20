import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AskInput from './components/ask-input/AskInput'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <AskInput />
    </>
  )
}

export default App
