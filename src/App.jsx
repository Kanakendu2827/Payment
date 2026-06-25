import { Routes, Route } from "react-router-dom";
import OrderForm from "./components/OrderForm";
import "./App.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<OrderForm />} />
    </Routes>
  );
}

export default App;