import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import qrCodeImage from "../assets/Qr code.jpeg";

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  const [screenshot, setScreenshot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!state?.formData) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>No Order Found</h2>
        <button onClick={() => navigate("/")}>Back To Order Form</button>
      </div>
    );
  }

  const submitOrder = async () => {
    if (!screenshot) {
      alert("Please upload payment screenshot");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();

      data.append("name", state.formData.name);
      data.append("mobile", state.formData.mobile);
      data.append("address", state.formData.address);
      data.append("email", state.formData.email);
      data.append("quantity", state.formData.quantity);
      data.append("total", state.total);
      data.append("file", screenshot);

      await fetch("YOUR_GOOGLE_APPS_SCRIPT_URL", {
        method: "POST",
        body: data,
      });

      alert("Order Submitted Successfully");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Submission Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "30px auto",
        padding: "20px",
      }}
    >
      <h1>Payment Page</h1>

      <h2>Amount Payable: ₹{state.total}</h2>

      <img src={qrCodeImage} alt="QR Code" width="250" />

      <br />
      <br />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setScreenshot(e.target.files[0])}
      />

      <br />
      <br />

      <button onClick={submitOrder} disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Order"}
      </button>
    </div>
  );
}

export default PaymentPage;