import Order from '../models/Order';

const getOrders = async () => {
    // Fetch products from the database
    const orders = await Order.find()
    return orders;
};

// 🟩 Get orders by date
const getOrdersByDate = async (date) => {
  if (!date) throw new Error("Date parameter is required");

  const start = new Date(date);
  const end = new Date(date);
  end.setDate(end.getDate() + 1);

  const orders = await Order.find({
    createdAt: { $gte: start, $lt: end },
  }).sort({ createdAt: -1 });

  return orders;
};

//-----------

// create a new Order
const createOrder =  async (data) => {
    try{
      const { paymentIntentId, email, mobile, items } = data;
      
      if (!paymentIntentId || !email || !mobile || !items || items.length === 0) {
          throw new Error("Missing order data");
      }

      // 🧩 Build order items array
      const orderItems = items.map((item) => ({
        productId: item._id,
        name: {
          en: item.name?.en || item.name,
          ar: item.name?.ar || "",
        },
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        selectedCategories: item.selectedCategories || [], // ✅ Preserve meal selections
        displayName: item.displayName || item.name?.en || "", // ✅ Add display name
      }));

      // 🧩 Calculate total price
      const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0  );

      // 🧾 Create new order document
      const newOrder = new Order({
        email,
        mobile,
        items: orderItems,
        totalPrice,
        paymentStatus: "paid",
        orderStatus: "Pending",
        paymentIntentId,
      });

      
      const saved = await newOrder.save();
      console.log("✅ Mongo saved:", saved._id);
      return saved;
    } catch (error) {
      console.error("❌ createOrder error:", error);
      throw error;
    }

}

// 🟩 Update order status
const updateOrder = async (id, data) => {
  return await Order.findByIdAndUpdate(id, { $set: data }, { new: true } );
};

// 🟩 Update order status
const updateOrderStatus = async (orderId, newStatus) => {
  if (!orderId || !newStatus) throw new Error("Missing parameters");

  const updated = await Order.findByIdAndUpdate(
    orderId,
    { orderStatus: newStatus },
    { new: true }
  );

  if (!updated) throw new Error("Order not found");

  console.log(`✅ Updated order ${orderId} → ${newStatus}`);
  return updated;
};

export  { getOrders, getOrdersByDate, createOrder, updateOrder, updateOrderStatus };
