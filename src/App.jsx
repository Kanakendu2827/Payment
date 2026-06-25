import { Routes, Route } from "react-router-dom";
import OrderForm from "./components/OrderForm";

function App() {
  return (
    <Routes>
      <Route path="/" element={<OrderForm />} />
    </Routes>
  );
}

export default App;