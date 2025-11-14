import React from "react";
import Link from "next/link";
//import { urlFor } from "../../lib/client";
import { NextSeo } from "next-seo";
//import { useRouter } from "next/router";

const  toTitleCase = (str)=> {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

const Product = ({ product }) => {
    const seoProductName = product.name.en || "Product";
return (
<>
    <NextSeo
        title={`${toTitleCase(seoProductName)} - Macaron Magic`}
        description="Great tasting home-made macarons"
    />

    <div>
        <Link href={`/product/${product._id}`}>
            <div className="product-card">
                <figure className="fliptile">
                    <img   src={product.image}    width={250}   height={250}  className="product-image"  />
                    <figcaption>
                        <p className="product-name">{product.name.en}</p>
                    </figcaption>
                </figure>

                <p className="product-name">{product.name.en}</p>
                <p className="product-price">
                    جنيه مصرى
                    {product.price.toLocaleString("ar-EG", {
                        maximumFractionDigits: 2,
                        minimumFractionDigits: 2,
                    })}
                </p>
            </div>
        </Link>
    </div>
</>

);
};

export default Product;
