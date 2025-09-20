import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import Soldier from './Soldier'

const App = () => {
  return (
    <Router>
    <div>
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path="/soldier" element={<Soldier/>} />
      </Routes>
    </div>
    </Router>
  )
}

export default App
