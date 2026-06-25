import { useState } from "react";
import { Atom } from "react-loading-indicators";

function OrderForm() {
  const PRODUCT_PRICE = 499;
  const GOOGLE_SCRIPT_URL = (import.meta.env.DEV
    ? "/api/google-script"
    : (import.meta.env.VITE_GOOGLE_SCRIPT_URL || "/api/google-script")
  ).trim();

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
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

    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("YOUR_")) {
      alert("Set VITE_GOOGLE_SCRIPT_URL in your .env file to send form data to Google Apps Script.");
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

      const payload = {
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        address: formData.address,
        product: "Payment Order",
        quantity: formData.quantity,
        size: formData.size,
        deliveryType: formData.deliveryType,
        sizeExtraCharge,
        deliveryCharge,
        amount: total,
        screenshot: screenshotDataUrl,
        fileType: screenshot?.type || "image/png",
      };

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        mode: "cors",
      });

      const resultText = await response.text();
      if (!response.ok) throw new Error(resultText || "Submission failed");

      alert("Order submitted successfully. Your details have been sent.");
      setShowPayment(false);
      setScreenshot(null);
      setFormData({ name: "", mobile: "", email: "", address: "", quantity: 1, size: "M", deliveryType: "hand" });
    } catch (error) {
      console.error(error);
      alert("Unable to submit your order right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "30px auto", padding: "24px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ background: "linear-gradient(135deg, #0f8f3f 0%, #7a0f2d 100%)", color: "#fff", padding: "28px", borderRadius: "16px", marginBottom: "24px" }}>
        <h1 style={{ margin: 0, fontSize: "28px" }}>Secure Checkout</h1>
        <p style={{ marginTop: "8px", fontSize: "16px", lineHeight: 1.5 }}>
          Fill in your details, review the bill, and complete the payment with a screenshot upload.
        </p>
      </div>

      <form onSubmit={showPayment ? handleSubmit : handleProceed}>
        <div style={{ display: "grid", gap: "24px", gridTemplateColumns: "1.2fr 0.8fr", alignItems: "start" }}>
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "24px", boxShadow: "0 6px 20px rgba(0,0,0,0.05)" }}>
            <h2 style={{ marginTop: 0 }}>Customer Details</h2>

            <label style={labelStyle}>Full Name</label>
            <input type="text" name="name" placeholder="Enter your full name" value={formData.name} onChange={handleChange} style={inputStyle} />
            {errors.name && <p style={errorStyle}>{errors.name}</p>}

            <label style={labelStyle}>Mobile Number</label>
            <input type="tel" name="mobile" placeholder="10-digit mobile number" value={formData.mobile} onChange={handleChange} style={inputStyle} />
            {errors.mobile && <p style={errorStyle}>{errors.mobile}</p>}

            <label style={labelStyle}>Email Address</label>
            <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleChange} style={inputStyle} />
            {errors.email && <p style={errorStyle}>{errors.email}</p>}

            <label style={labelStyle}>Full Address</label>
            <textarea name="address" placeholder="Enter your full address" value={formData.address} onChange={handleChange} style={{ ...inputStyle, minHeight: "110px" }} />
            {errors.address && <p style={errorStyle}>{errors.address}</p>}

            <label style={labelStyle}>Quantity</label>
            <input type="number" min="1" name="quantity" value={formData.quantity} onChange={handleChange} style={inputStyle} />

            <label style={labelStyle}>T-shirt Size</label>
            <select name="size" value={formData.size} onChange={handleChange} style={inputStyle}>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="2XL">2XL</option>
              <option value="3XL">3XL (+₹40)</option>
              <option value="4XL">4XL (+₹80)</option>
              <option value="5XL">5XL (+₹120)</option>
            </select>
            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "-4px", marginBottom: "8px" }}>
              Size extra charges apply only for 3XL, 4XL, and 5XL.
            </p>

            <label style={labelStyle}>Delivery Type</label>
            <select name="deliveryType" value={formData.deliveryType} onChange={handleChange} style={inputStyle}>
              <option value="hand">Hand to Hand Delivery (No courier charges)</option>
              <option value="courier">Courier Service (+₹100)</option>
            </select>
          </div>

          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", boxShadow: "0 6px 20px rgba(0,0,0,0.04)" }}>
            <h2 style={{ marginTop: 0 }}>Bill Summary</h2>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span>Product Price</span>
              <strong>₹{PRODUCT_PRICE}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span>Subtotal</span>
              <strong>₹{subtotal}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span>Size Extra Charge</span>
              <strong>₹{sizeExtraCharge}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span>Delivery Charge</span>
              <strong>₹{deliveryCharge}</strong>
            </div>
            <hr />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "20px", marginTop: "12px" }}>
              <span>Total</span>
              <strong>₹{total}</strong>
            </div>

            <button type="submit" style={{ marginTop: "24px", width: "100%", padding: "14px", background: "linear-gradient(135deg, #0f8f3f 0%, #7a0f2d 100%)", color: "#fff", border: "none", borderRadius: "10px", fontSize: "16px", cursor: isSubmitting ? "wait" : "pointer", opacity: isSubmitting ? 0.85 : 1 }}>
              {showPayment ? (isSubmitting ? "Submitting..." : "Submit Order") : "Proceed to Payment"}
            </button>

            <p style={{ fontSize: "13px", color: "#64748b", marginTop: "12px" }}>
              After you submit the payment screenshot, your payment verification will be reviewed by our admin. Once approved, the bill will be sent to your mobile number or WhatsApp.
            </p>
          </div>
        </div>

        {showPayment && (
          <div style={{ marginTop: "24px", background: "linear-gradient(135deg, #f7fff9 0%, #fdf2f5 100%)", border: "1px solid #e5e7eb", borderRadius: "16px", padding: "24px", boxShadow: "0 6px 20px rgba(0,0,0,0.05)" }}>
            <h2 style={{ marginTop: 0 }}>Payment</h2>
            <p>Scan the QR code and upload the payment screenshot after completing the transfer.</p>
            <img src="/src/assets/Qr code.jpeg" alt="Payment QR Code" style={{ width: "220px", height: "220px", border: "1px solid #ddd", borderRadius: "12px", padding: "12px", objectFit: "contain" }} />
            <div style={{ marginTop: "16px" }}>
              <label style={labelStyle}>Upload Payment Screenshot</label>
              <input type="file" accept="image/*" onChange={(e) => setScreenshot(e.target.files[0])} style={{ display: "block", marginTop: "8px" }} />
            </div>

            {isSubmitting && (
              <div style={{ marginTop: "16px", display: "flex", justifyContent: "column", alignItems: "center", gap: "8px", color: "#0f8f3f", fontWeight: 600 }}>
                <Atom color="#32cd32" size="medium" text="" textColor="" />
                <span>Submitting your payment proof...</span>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "12px",
  marginTop: "8px",
  marginBottom: "8px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  fontSize: "15px",
};

const labelStyle = {
  fontWeight: "600",
  color: "#334155",
  marginTop: "8px",
  display: "block",
};

const errorStyle = {
  color: "#dc2626",
  marginTop: "-4px",
  marginBottom: "8px",
  fontSize: "14px",
};

export default OrderForm;