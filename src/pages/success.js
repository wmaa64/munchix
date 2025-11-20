import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BsBagCheckFill } from "react-icons/bs";
import { useRouter } from "next/router";

import { useStateContext } from "../../context/StateContext";
import { runFireworks } from "../../lib/utils";

const Success = () => {
  const { setCartItems, setTotalPrice, setTotalQuantities } = useStateContext();

  const router = useRouter();
  const { session_id, email, mobile } = router.query;

  useEffect(() => {
    if (!router.isReady) return; // ⛔ wait until query params are ready
    if (!session_id || !email || !mobile) {
      console.warn("Missing session_id or email or mobile in query");
      return;
    }

    const saveOrder = async () => {
      try {

         // 1️⃣ Fetch Stripe session details
        const res = await fetch(`/api/stripe/stripe-session?session_id=${session_id}`);
        const session = await res.json();

        // 2️⃣ Save the order to MongoDB
        let itemsOfCart = JSON.parse(localStorage.getItem("cartBackup"));

        if (!itemsOfCart || itemsOfCart.length === 0) {
          console.log("❌ No cart items found, skipping order save.");
          return;
        }

        console.log("📦 Sending order to API:", { email, mobile, itemsOfCart });

        // 3️⃣ Format each item properly for MongoDB
        const formattedItems = itemsOfCart.map((item) => {
          if (item.producttype === "meal" && Array.isArray(item.selectedCategories)) {
            return {
              productId: item._id,
              name: item.name,
              displayName: item.displayName || item.name?.en || "", // ✅ Add this line
              price: item.price,
              quantity: item.quantity,
              image: item.image,
              selectedCategories: item.selectedCategories.map((cat) => ({
                category: cat.category,
                selectedItems: (cat.selectedItems || []).map((si) => ({
                  name: si.product?.name?.en || "",
                  price: si.product?.price || 0,
                  quantity: si.quantity,
                  image: si.product?.image || "",
                })),
              })),
            };
          } else {
            return {
              productId: item._id,
              name: item.name,
              displayName: item.displayName || item.name?.en || "",
              price: item.price,
              quantity: item.quantity,
              image: item.image,
            };
          }
        });

        try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: formattedItems,
            email,
            mobile,
            paymentIntentId: session.payment_intent, 
          }),
        });
      } catch (error) {
          console.error("❌ createOrder error:", error);
          res.status(500).json({ message: "Error saving order", error: error.message });
      }
        /*
        if (!response.ok) {
          console.error("Failed to save order");
        } else {
          console.log("Order saved successfully");
        }
          */

      } catch (error) {
        console.error("Error saving order:", error);
      }
    };

    saveOrder();

    // Clear cart and run animation
    setCartItems([]);
    setTotalPrice(0);
    setTotalQuantities(0);
    runFireworks();
  }, [router.isReady, session_id, email, mobile]);



  return (
    <div className="success-wrapper">
      <div className="success">
        <p className="icon">
          <BsBagCheckFill />
        </p>
        <h2>Thank you for your order!</h2>
        <p className="email-msg">Check your email inbox for the receipt.</p>
        <p className="description">
          If you have any questions, please email: 
          <a className="email" href="mailto:wmaa64@yahoo.com">
            wmaa64@yahoo.com
          </a>
        </p>
        <Link href="/">
          <button type="button" width="300px" className="btn">
            Continue Shopping
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Success;