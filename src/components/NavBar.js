import React, { useState, useEffect } from "react";
import Link from "next/link";
import {AiOutlineShopping} from "react-icons/ai";
import { Cart } from "./";

import { useStateContext } from "../../context/StateContext";

const NavBar = () => {
  const { showCart, setShowCart, totalQuantities, userInfo, logoutUser } = useStateContext();
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);

   // ✅ Fetch data client-side from API route
   useEffect(() => {
     const fetchSubcategories = async () => {
       try {
         const res = await fetch("/api/subcategories");
         if (!res.ok) {
           throw new Error("Failed to fetch subcategories");
         }
         const data = await res.json();
         setSubcategories(data);
       } catch (error) {
         console.error("Error fetching subcategories:", error);
       } finally {
         setLoading(false);
       }
     };
 
     fetchSubcategories();
   }, []);
 
  
return (
<div className="navbar-container">
    <div className="company-name">
        <Link href="/"><h5>Munchix Food</h5></Link>
        <div className="navbar" logo="true">
            {userInfo?.isAdmin ? (
                <>
                    <Link href="/products/manage">Manage Products</Link>
                    <Link href="/orders/manage">Manage Orders</Link>
                </> ) : (
                <>
                    {
                        loading ? (
                            <p>Loading...</p>
                        ) : (
                            subcategories.map((subcategory) => (
                                <Link key={subcategory._id} href={`/shop?subcategoryId=${subcategory._id}`}>
                                    {subcategory.name?.en}
                                </Link>
                            ))
                        )
                    }

                    {/*<Link href="/shop">Classic Burgers</Link>
                    <Link href="/villas">Signature Burgers</Link>
                    <Link href="/appartements">Premium Burgers</Link>
                    <Link href="/antiques">Chicken Selection</Link>
                    <Link href="/clothes">Side Items</Link>
                    <Link href="/contact">Baverages</Link>
                    <Link href="/about">About</Link>*/}
                </>
            )}
            {userInfo ? (
                <button onClick={logoutUser} style={{ color: "red" , border: "none", background: "transparent", cursor: "pointer" }}>
                    Logout
                </button>
            ) : (
                <>
                    <Link href="/users/login">
                        <button style={{ color: "red", border: "none", background: "transparent", cursor: "pointer" }}>
                            Login
                        </button>
                    </Link>
                    <Link href="/users/register">
                        <button style={{color: "red", border: "none", background: "transparent", cursor: "pointer" }}>
                            Register
                        </button>

                    </Link>
                </>
             )}
            
            <button  type="button"   className="cart-icon"  onClick={() => setShowCart(true)}>
                <AiOutlineShopping />
                <span className="cart-item-qty">{totalQuantities}</span>
            </button>
            {showCart && <Cart />}
        </div>
    </div>
</div>
);

}
export default NavBar;
