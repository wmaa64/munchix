import React, { useRef, useState } from "react";
import Link from "next/link";
import {AiOutlineMinus,AiOutlinePlus,AiOutlineLeft,AiOutlineShopping,} from "react-icons/ai";
import { TiDeleteOutline } from "react-icons/ti";
import { useStateContext } from "../../context/StateContext";
//import { urlFor } from "../../lib/client";
import { eUSLocale } from "../../lib/utils";
import EmptyCart from "./Cart/EmptyCart";
import getStripe from "../../lib/getStripe";
import toast from "react-hot-toast";

const Cart = () => {
    const cartRef = useRef();
    const {totalPrice,totalQuantities,cartItems,setShowCart,toggleCartItemQuantity,onRemove,} = useStateContext();

    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [isValid, setIsValid] = useState(false);
    const [loading, setLoading] = useState(false);    

    // ✅ Validate inputs dynamically
    const validateInputs = (email, mobile) => {
        const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        const mobileValid = /^\d{11}$/.test(mobile);
        setIsValid(emailValid && mobileValid);
    };

    const handleEmailChange = (e) => {
        const newEmail = e.target.value;
        setEmail(newEmail);
        validateInputs(newEmail, mobile);
    };

    const handleMobileChange = (e) => {
        const newMobile = e.target.value;
        setMobile(newMobile);
        validateInputs(email, newMobile);
    };
    
    const handleCheckout = async () => {
        if (!isValid) {
            toast.error("Please enter a valid email and 11-digit phone number.");
            return;
        }

        try{
            const stripe = await getStripe();
            setLoading(true);

            localStorage.setItem("cartBackup", JSON.stringify(cartItems));
            
            const response = await fetch("/api/stripe/stripe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ 
                    // send your cart and customer info
                    items: cartItems,
                    email,  // you can replace with dynamic email
                    mobile, // same here
                    }),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error("Stripe API error:", error); // 👈 add this
                throw new Error(error.message || "Checkout failed");
            }

            const data = await response.json();
            toast.loading("Redirecting to payment...");

            // ✅ open the Stripe Checkout page directly
            window.location.href = data.url;
        } catch (err) {
        console.error(err);
        toast.error("Checkout failed");
        } finally {
        setLoading(false);
        }
    };

return (
    <div className="cart-wrapper" ref={cartRef}>
        <div className="cart-container">
            <button type="button" className="cart-heading" onClick={() => setShowCart(false)}>
                <AiOutlineLeft />
                <span className="heading">Your Cart</span>
                <span className="cart-num-items">({totalQuantities} items)</span>
            </button>

            {cartItems.length < 1 && (
                <EmptyCart>
                    <Link href="/">
                        <button type="button" onClick={() => setShowCart(false)} className="btn">
                            Continue Shopping
                        </button>
                    </Link>
                </EmptyCart>
            )}

            <div className="product-container">
                {cartItems.length >= 1 && cartItems.map((item) => (
                    <>
                        <div className="product" key={item._id}>
                            <button type="button"  className="remove-item" onClick={() => onRemove(item)}        >
                                <TiDeleteOutline />
                            </button>
                            <img  src={(item?.image)} className="cart-product-image"  />
                            
                            <div className="item-desc">
                                <div>
                                    {/* 🧠 Show combo readable name if exists */}
                                    <span style={{ fontWeight: "600", display: "block" }}>
                                        {item.displayName || item.name?.en || item.name}
                                    </span>

                                    {/* 🧩 Show meal details under combo */}
                                    {item.producttype === "meal" && item.selectedCategories?.length > 0 && (
                                        <div  style={{ marginTop: "8px",
                                                       fontSize: "0.9rem",
                                                       color: "#555",
                                                       marginLeft: "10px", }}
                                        >
                                            {item.selectedCategories.map((cat, cIndex) => (
                                                <div key={cIndex} style={{ marginBottom: "4px" }}>
                                                    <strong>{cat.category}:</strong>{" "}
                                                    {cat.selectedItems.map((si, iIndex) => (
                                                        <span key={iIndex}>
                                                            {si.quantity}x {si.product?.name?.en}
                                                            {iIndex < cat.selectedItems.length - 1 ? " + " : ""}
                                                        </span>
                                                    ))}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <span style={{ display: "block", marginTop: "8px" }}>
                                        {item.quantity} @ {item.price} EGP
                                    </span>
                                </div>
                            </div>
                        </div>
                    </>
                ))}
            </div>

            {cartItems.length >= 1 && (
                <div className="cart-bottom">
                    <div className="customer-info">
                        <label>Enter Valid Email:</label>
                        <input  className="input-field" type="email"  placeholder="Enter your email"         value={email}   required
                            onChange={handleEmailChange} 
                        />
                        <label>Enter Phone Number (11 digits):</label>
                        <input  className="input-field" type="tel"    placeholder="Enter your phone number"  value={mobile}  required
                            onChange={handleMobileChange}
                        />
                    </div>
                    
                    <div className="total">
                        <h3>Subtotal:</h3>
                        <h3>جنيه{eUSLocale(totalPrice)}</h3>
                    </div>
                    
                    <div className="btn-container">
                        <button type="button" className="btn" onClick={handleCheckout} bisabled={!isValid || !loading} 
                            style={{
                            opacity: !isValid || loading ? 0.5 : 1,
                            cursor: !isValid || loading ? "not-allowed" : "pointer",
                            }}>
                            {loading ? "Processing..." : "Pay with Stripe"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    </div>
);
};

export default Cart;