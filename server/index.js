import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/authRoute/route.js";
import petRoutes from "./routes/petRoutes.js";
import adoptionRoutes from "./routes/adoptionRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import rescueRoutes from "./routes/rescueRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "PetEase API is running!" });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/adoptions", adoptionRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/doctors", doctorRoutes); // Use doctor routes
app.use("/api/payment", paymentRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/rescue", rescueRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);

// Socket.io Connection
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_chat", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room: ${room}`);
  });



  // ... existing code ...

  socket.on("send_message", async (data) => {
    // data: { roomId, senderId, message, timestamp, senderName }
    try {
      // Save to DB
      const savedMessage = await prisma.message.create({
        data: {
          chatId: parseInt(data.roomId),
          senderId: parseInt(data.senderId),
          messageText: data.message,
          messageType: 'text'
        }
      });

      // Emit with potentially updated data (like ID)
      io.to(data.roomId).emit("receive_message", data);
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("typing", (data) => {
    socket.to(data.roomId).emit("typing", data);
  });

  socket.on("stop_typing", (data) => {
    socket.to(data.roomId).emit("stop_typing", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
