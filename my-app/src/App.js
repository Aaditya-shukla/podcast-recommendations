import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from './Home'
import  { Podcasts } from './Podcasts'
import Episodes from './Episodes'

function App() {
  
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Podcasts />} />
          <Route path="/episodes" element={<Episodes />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
