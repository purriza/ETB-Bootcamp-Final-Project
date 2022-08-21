import "./App.css";

import { useEffect, useState } from "react";
import Header from "./components/Header";
import { Route, Routes } from "react-router-dom";
import ProductList from "./components/ProductList";
import ProductDetail from "./components/ProductDetail";
import UserDetail from "./components/UserDetail";
import { getBlockchain } from "./utils/common";

function App() {
  const [blockchain, setBlockchain] = useState({});

  useEffect(() => { 
    (async () => {
      setBlockchain(await getBlockchain());
    })();
  }, []);

  return (
    <div>
      <Header blockchain={blockchain} /> 
      <Routes>
        <Route path="/" element={<ProductList blockchain={blockchain} />} />
        <Route
          path="/product/:id"
          element={<ProductDetail blockchain={blockchain} />}
        />
        <Route 
          path="/user/" 
          element={<UserDetail blockchain={blockchain} />} 
        />
      </Routes>
    </div>
  );
}

export default App;
