import React, { useState, useEffect } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { Product, Info, StarRating } from "../../components";
import { useStateContext } from "../../../context/StateContext";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";

const toTitleCase = (str) =>
  str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

const ProductDetails = () => {
  const router = useRouter();
  const { id } = router.query; // get product ID from URL
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { decQty, incQty, qty, onAdd, setShowCart } = useStateContext();

  useEffect(() => {
    if (!id) return; // Wait until router is ready

    const fetchData = async () => {
      try {
        const [productRes, productsRes] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch(`/api/products`),
        ]);

        const productData = await productRes.json();
        const productsData = await productsRes.json();
      
          // 🔹 Redirect meals to /meal/[id]
        if (productData.producttype === "meal") {
          router.replace(`/meal/${id}`);
          return;
        }

        setProduct(productData);
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleBuyNow = () => {
    if (product) {
      onAdd(product, qty);
      setShowCart(true);
    }
  };

  if (loading) return <p>Loading product details...</p>;
  if (!product) return <p>Product not found.</p>;

  return (
    <>
      <NextSeo title={`${toTitleCase(product.name.en)} - Things to Sale`} description="All Things to Sale" />

      <div>
        <div className="product-detail-container">
          <div>
            <div className="image-container">
              <img src={product.image} alt={product.name.en} className="product-detail-image" />
            </div>
          </div>

          <div className="product-detail-desc">
            <h1>{product.name.en}</h1>

            <div className="reviews">
              <StarRating />
              <p>(20)</p>
            </div>

            <h4>Details:</h4>
            <p>{product.description.en}</p>

            <p className="price">
              جنيه مصرى
              {product.price.toLocaleString("ar-EG", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
              })}
            </p>

            <div className="quantity">
              <h3>Quantity:</h3>
              <p className="quantity-desc">
                <span className="minus" onClick={decQty}>
                  <AiOutlineMinus />
                </span>
                <span className="num">{qty}</span>
                <span className="plus" onClick={incQty}>
                  <AiOutlinePlus />
                </span>
              </p>
            </div>

            <div className="sku">SKU: {product._id}</div>

            <div className="buttons">
              <button type="button" className="add-to-cart" onClick={() => onAdd(product, qty)}>
                Add to Cart
              </button>

              <button type="button" className="button btn-cart" onClick={() => onAdd(product, qty)}>
                <span>
                  <span>Add to My Bag</span>
                </span>
              </button>

              <button type="button" className="buy-now" onClick={handleBuyNow}>
                Buy Now
              </button>
            </div>
          </div>
        </div>

        <div className="maylike-products-wrapper">
          <h2>You may also like</h2>
          <div className="marquee">
            <div className="maylike-products-container track">
              {products.map((item) => (
                <Product key={item._id} product={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetails;





/*
import React, {useState} from "react";
import {AiOutlineMinus, AiOutlinePlus, AiFillStar, AiOutlineStar} from "react-icons/ai";
import connectDB    from "../../../lib/db";
import { getProducts, getProductById } from "../../../controllers/productController";
import { Product } from "../../components";
import { Info } from "../../components";
import { StarRating } from "../../components";
import { useStateContext } from "../../../context/StateContext";
import { useRouter } from "next/router";
import { NextSeo } from "next-seo";


const ProductDetails = ({ product, products }) => {
const { name, description, price, image, categoryId } = product;
const [index, setIndex] = useState(0);
const { decQty, incQty, qty, onAdd, setShowCart } = useStateContext();

    const { asPath } = useRouter();
    let seoProductId = asPath.split("/")[2];
    let seoProductName = "";
    
    if (seoProductId != null) {
        seoProductName = seoProductId.replace(/-/g, " ");
        if (seoProductId === product._id.toString() ) {
            seoProductName = toTitleCase(seoProductId.replace(/-/g, " "));

            // Debug logs
            console.log("seoProductId:", seoProductId);
            console.log("id.current:", product._id.stringify); // use ? to avoid crash if slug is undefined

        }
    }

const handleBuyNow = () => {
    onAdd(product, qty);
    setShowCart(true);
};

return (
<>
    <NextSeo
        title={`${toTitleCase(seoProductName)} - Things to Sale`}
        description="All Things to Sale"
    />

<div>
    <div className="product-detail-container">
        <div>
            <div className="image-container">
                <img  src={image}  className="product-detail-image" />
            </div>

        </div>
    
        <div className="product-detail-desc">
            <h1>{name.en}</h1>
            <div className="reviews">
                
                <StarRating />
                <p>(20)</p>
            </div>
            <h4>Details: </h4>
            <p>{description.en}</p>
            <p className="price">
                جنيه مصرى{price.toLocaleString("ar-EG", {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2,
                })}
            </p>

            <div className="quantity">
                <h3>Quantity:</h3>
                <p className="quantity-desc">
                    <span className="minus" onClick={decQty}>
                        <AiOutlineMinus />
                    </span>
                    <span className="num">{qty}</span>
                    <span className="plus" onClick={incQty}>
                        <AiOutlinePlus />
                    </span>
                </p>
            </div>
            
            <div className="sku">SKU: {product._id.toString()}</div>
            
            <div className="buttons">
                <button   type="button"  className="add-to-cart"  onClick={() => onAdd(product, qty)}                    >
                    Add to Cart
                </button>
                

                <button   type="button"  className="button btn-cart"  onClick={() => onAdd(product, qty)} >
                    <span>
                        <span>Add to My Bag</span>
                    </span>
                </button>
                
                <button type="button" className="buy-now" onClick={handleBuyNow}>
                    Buy Now
                </button>
            </div>
        </div>
    </div>

    <div className="maylike-products-wrapper">
        <h2>You may also like</h2>
        <div className="marquee">
            <div className="maylike-products-container track">
                {products.map((item) => (
                    <Product key={item._id} product={item} />
                ))}
            </div>
        </div>
    </div>
</div>
</>
);
};

export const getStaticPaths = async () => {
  await connectDB();

  const products = await getProducts();
  const paths = products.map((p) => ({
    params: { id: p._id.toString() },
  }));

  return { paths, fallback: "blocking" };
};

export const getStaticProps = async ({ params }) => {
  await connectDB();

  const product = await getProductById(params.id);
  const products = await getProducts();

  return {
    props: {
      product: JSON.parse(JSON.stringify(product)),
      products: JSON.parse(JSON.stringify(products)),
    },
    revalidate: 10,
  };
};

export default ProductDetails;
*/