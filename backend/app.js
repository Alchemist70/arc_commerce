const cartRoutes = require("./routes/cart");
const wishlistRoutes = require("./routes/wishlist");

app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
