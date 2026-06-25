import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import qrCodeImage from "../assets/Qr.jpg";

function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;
  const GOOGLE_SCRIPT_URL = "/api/google-script";

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

    if (!GOOGLE_SCRIPT_URL) {
      alert("Submission endpoint is not configured. Please set VITE_GOOGLE_APPS_SCRIPT_URL in your environment.");
      return;
    }

    setIsSubmitting(true);

    try {
      const screenshotDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(screenshot);
      });

      const data = {
        name: state.formData.name,
        mobile: state.formData.mobile,
        address: state.formData.address,
        email: state.formData.email,
        quantity: state.formData.quantity,
        amount: String(state.total),
        product: "Payment Order",
        screenshot: screenshotDataUrl,
        screenshotBase64: screenshotDataUrl.split(',')[1] || "",
        screenshotType: screenshot.type || "image/png",
        screenshotName: screenshot.name || "payment.png",
        fileType: screenshot.type || "image/png",
      };

      let response;
      try {
        response = await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(data),
        });
      } catch (networkError) {
        throw new Error("Network request failed: " + (networkError?.message || networkError), {
          cause: networkError,
        });
      }

      let resultText = "";
      try {
        resultText = await response.text();
      } catch {
        resultText = "";
      }

      let result = null;
      if (resultText) {
        try {
          result = JSON.parse(resultText);
        } catch {
          result = null;
        }
      }

      if (!response.ok || (result && result.success === false)) {
        throw new Error(result?.error || result?.message || resultText || "Submission failed");
      }

      alert(result?.message || "Order Submitted Successfully");
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