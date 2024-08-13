import  express  from "express";
const vendorRouter = express.Router()
import authController from "../../adaptors/vendorController/authController";
import Controller from "../../adaptors/vendorController/Controller";
import vendorAuth from "../middlewares/VendorMiddleware";


vendorRouter.post("/api/vendor/signup",authController.signUp)
vendorRouter.post("/api/vendor/otp",authController.verifyOtp)
vendorRouter.post("/api/vendor/resendOtp",authController.resendOtp)
vendorRouter.post("/api/vendor/login",authController.login)
vendorRouter.put("/api/vendor/validEmail",authController.verifyEmail)
vendorRouter.post("/api/vendor/verifyFotp",authController.verifyFotp)
vendorRouter.put("/api/vendor/forgotPassword",authController.updatePassword)
vendorRouter.post("/api/vendor/googlesignup",authController.googleRegistration)
vendorRouter.post("/api/vendor/googleLogin",authController.googleLogin)
vendorRouter.put("/api/vendor/addRequest",Controller.request)
vendorRouter.get("/api/vendor/getCategories",Controller.getCategories)
vendorRouter.post("/api/vendor/uploadPost/:id",vendorAuth,Controller.uploadPost)
vendorRouter.get("/api/vendor/requsts/:vendorId",vendorAuth,Controller.listRequests)   
vendorRouter.post("/api/vendor/acceptRequest",vendorAuth,Controller.acceptRequest)   
vendorRouter.delete("/api/vendor/removeRequest/:roomId",vendorAuth,Controller.rejectRequest)   
vendorRouter.get("/api/vendor/fetchUsers/:vendorId",vendorAuth,Controller.fetchUsers)   
vendorRouter.get("/api/vendor/getMessages/:chatId",vendorAuth,Controller.messages)   
vendorRouter.get("/api/vendor/chatId/:userId/:vendorId",vendorAuth,Controller.chatId)   
vendorRouter.get("/api/vendor/bookings/:vendorId",vendorAuth,Controller.getBookings)
vendorRouter.delete("/api/vendor/cancelBooking/:bookingId",vendorAuth,Controller.cancelBooking)
vendorRouter.patch("/api/vendor/acceptBooking/:bookingId",vendorAuth,Controller.acceptBooking)
vendorRouter.get("/api/vendor/profile/:vendorId",vendorAuth,Controller.getProfile)
vendorRouter.put("/api/vendor/updateProfile/:vendorId",vendorAuth,Controller.updateProfile)
vendorRouter.get('/api/vendor/absentDates/:vendorId',vendorAuth,Controller.getDates)
vendorRouter.patch('/api/vendor/updateDates/:vendorId',vendorAuth,Controller.updateDates)
vendorRouter.put('/api/vendor/updateBooking/:bookingId',vendorAuth,Controller.updateBooking) 
vendorRouter.post('/api/vendor/billing',vendorAuth,Controller.billing)   
vendorRouter.get('/api/vendor/notifications/:userId',vendorAuth,Controller.notification)
vendorRouter.get('/api/vendor/roomIds/:vendorId',vendorAuth,Controller.room)
vendorRouter.get('/api/vendor/reviews/:vendorId',vendorAuth,Controller.review)
vendorRouter.get('/api/vendor/wallet/:vendorId',vendorAuth,Controller.wallet)
export default vendorRouter