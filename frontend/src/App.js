import "./App.css";

import { useEffect, useState } from "react";
import Header from "./components/Header";
import { Route, Routes } from "react-router-dom";
import ProductList from "./components/ProductList";
import ProductDetail from "./components/ProductDetail";
import ServiceList from "./components/ServiceList";
import ServiceDetail from "./components/ServiceDetail";
import BookingList from "./components/BookingList";
import BookingDetail from "./components/BookingDetail";
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
      <ProductList blockchain={blockchain} /> 
      <ServiceList blockchain={blockchain} /> 
      <BookingList blockchain={blockchain} /> 
      <Routes>
        <Route
          path="/product/:id"
          element={<ProductDetail blockchain={blockchain} />}
        />
        <Route
          path="/service/:id"
          element={<ServiceDetail blockchain={blockchain} />}
        />
        <Route
          path="/booking/:id"
          element={<BookingDetail blockchain={blockchain} />}
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
