import { useState } from "react";
import qrCodeImage from "../assets/Qr.jpg";

function OrderForm() {
  const PRODUCT_PRICE = 499;
  const GOOGLE_SCRIPT_URL = "/api/google-script";

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    memberId: "",
    address: "",
    quantity: 1,
    size: "M",
    deliveryType: "hand",
  });
  const [errors, setErrors] = useState({});
  const [showPayment, setShowPayment] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sizeExtraCharges = {
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    "2XL": 0,
    "3XL": 40,
    "4XL": 80,
    "5XL": 120,
  };

  const deliveryCharges = {
    hand: 0,
    courier: 100,
  };

  const subtotal = PRODUCT_PRICE * formData.quantity;
  const sizeExtraCharge = sizeExtraCharges[formData.size] || 0;
  const deliveryCharge = deliveryCharges[formData.deliveryType] || 0;
  const total = subtotal + sizeExtraCharge + deliveryCharge;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Math.max(1, Number(value) || 1) : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!/^[0-9]{10}$/.test(formData.mobile)) newErrors.mobile = "Enter a valid 10-digit mobile number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Enter a valid email";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceed = (e) => {
    e.preventDefault();

    if (!validate()) return;

    setShowPayment(true);
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!screenshot) {
      alert("Please upload a payment screenshot before submitting.");
      return;
    }

    if (!GOOGLE_SCRIPT_URL) {
      alert("Submission endpoint is not configured. Please set VITE_GOOGLE_APPS_SCRIPT_URL in your environment.");
      return;
    }

    setIsSubmitting(true);

    try {
      const toDataUrl = (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

      const screenshotDataUrl = await toDataUrl(screenshot);
      const column1Value = formData.deliveryType === "courier"
        ? formData.address
        : "Hand to Hand Delivery";

      const payload = {
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        memberId: formData.memberId || "",
        address: column1Value,
        quantity: formData.quantity,
        size: formData.size,
        tshirtSize: formData.size,
        deliveryType: formData.deliveryType,
        amount: total,
        product: "Payment Order",
        screenshot: screenshotDataUrl,
        screenshotBase64: screenshotDataUrl.split(',')[1] || "",
        screenshotType: screenshot.type || "image/png",
        screenshotName: screenshot.name || "payment-screenshot.png",
        fileType: screenshot.type || "image/png"
      };

let response;

try {
  response = await fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(payload),
  });
} catch (networkError) {
  throw new Error("Network request failed", { cause: networkError });
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

      alert(result?.message || "Order submitted successfully. Your details have been sent.");
      setShowPayment(false);
      setScreenshot(null);
      setFormData({ name: "", mobile: "", email: "", memberId: "", address: "", quantity: 1, size: "M", deliveryType: "hand" });
    } catch (error) {
      console.error(error);
      alert(error?.message || "Unable to submit your order right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Secure Checkout</h1>
        <p>
          Fill in your details, review the bill, and complete the payment with a screenshot upload.
        </p>
      </div>

      <form onSubmit={showPayment ? handleSubmit : handleProceed}>
        <div className="checkout-layout">
          <div className="checkout-card">
            <h2>Customer Details</h2>

            <label className="checkout-label">Full Name</label>
            <input type="text" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange} className="checkout-input" />
            {errors.name && <p className="checkout-error">{errors.name}</p>}

            <label className="checkout-label">Mobile Number</label>
            <input type="tel" name="mobile" placeholder="10-digit mobile number" value={formData.mobile} onChange={handleChange} className="checkout-input" />
            {errors.mobile && <p className="checkout-error">{errors.mobile}</p>}

            <label className="checkout-label">Email Address</label>
            <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} className="checkout-input" />
            {errors.email && <p className="checkout-error">{errors.email}</p>}

            <label className="checkout-label">Member ID</label>
            <input type="text" name="memberId" placeholder="Enter member ID (optional)" value={formData.memberId} onChange={handleChange} className="checkout-input" />

            <label className="checkout-label">Full Address</label>
            <textarea name="address" placeholder="Enter your full address" value={formData.address} onChange={handleChange} className="checkout-input" style={{ minHeight: "110px" }} />
            {errors.address && <p className="checkout-error">{errors.address}</p>}

            <label className="checkout-label">Quantity</label>
            <input type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} className="checkout-input" />

            <label className="checkout-label">T-shirt Size</label>
            <select name="size" value={formData.size} onChange={handleChange} className="checkout-input">
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="2XL">2XL</option>
              <option value="3XL">3XL (+₹40)</option>
              <option value="4XL">4XL (+₹80)</option>
              <option value="5XL">5XL (+₹120)</option>
            </select>
            <p className="checkout-helper">
              Size extra charges apply only for 3XL, 4XL, and 5XL.
            </p>

            <label className="checkout-label">Delivery Type</label>
            <select name="deliveryType" value={formData.deliveryType} onChange={handleChange} className="checkout-input">
              <option value="hand">Hand to Hand Delivery (No courier charges)</option>
              <option value="courier">Courier Service (+₹100)</option>
            </select>
          </div>

          <div className="checkout-card checkout-card--summary">
            <h2>Bill Summary</h2>
            <div className="checkout-summary-row">
              <span>Product Price</span>
              <strong>₹{PRODUCT_PRICE}</strong>
            </div>
            <div className="checkout-summary-row">
              <span>Subtotal</span>
              <strong>₹{subtotal}</strong>
            </div>
            <div className="checkout-summary-row">
              <span>Size Extra Charge</span>
              <strong>₹{sizeExtraCharge}</strong>
            </div>
            <div className="checkout-summary-row">
              <span>Delivery Charge</span>
              <strong>₹{deliveryCharge}</strong>
            </div>
            <hr />
            <div className="checkout-total-row">
              <span>Total</span>
              <strong>₹{total}</strong>
            </div>

            <button className="checkout-button" type="submit" style={{ marginTop: "24px" }} disabled={isSubmitting}>
              {showPayment ? (isSubmitting ? "Submitting..." : "Submit Order") : "Proceed to Payment"}
            </button>

            <p className="checkout-payment-note">
              After you submit the payment screenshot, your payment verification will be reviewed by our admin. Once approved, the bill will be sent to your mobile number or WhatsApp.
            </p>
          </div>
        </div>

        {showPayment && (
          <div className="checkout-card checkout-card--payment" style={{ marginTop: "24px" }}>
            <h2>Payment</h2>
            <p className="checkout-helper">Scan the QR code and upload the payment screenshot after completing the transfer.</p>
            <img src={qrCodeImage} alt="Payment QR Code" className="checkout-qr" />
            <div style={{ marginTop: "16px" }}>
              <label className="checkout-label">Upload Payment Screenshot</label>
              <input type="file" accept="image/*" onChange={(e) => setScreenshot(e.target.files[0])} className="checkout-input" style={{ display: "block", marginTop: "8px" }} />
            </div>

            {isSubmitting && (
              <div className="checkout-submitting">
                <span>Submitting your payment proof...</span>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

export default OrderForm;