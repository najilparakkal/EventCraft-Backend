"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUsers = void 0;
const awsConfig_1 = require("../../../config/awsConfig");
const chatModal_1 = __importDefault(require("../../../framworks/database/models/chatModal"));
const licence_1 = require("../../../framworks/database/models/licence");
const message_1 = __importDefault(require("../../../framworks/database/models/message"));
const requests_1 = require("../../../framworks/database/models/requests");
const user_1 = require("../../../framworks/database/models/user");
const vendor_1 = require("../../../framworks/database/models/vendor");
const booking_1 = require("../../../framworks/database/models/booking");
const mongoose_1 = __importDefault(require("mongoose"));
const billing_1 = __importDefault(require("../../../framworks/database/models/billing"));
const helpUser_1 = require("../../../framworks/database/models/helpUser");
const comment_1 = require("../../../framworks/database/models/comment");
const post_1 = require("../../../framworks/database/models/post");
exports.default = {
    addRequest: (datas, images) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const filePaths = images["values[licenseOrCertificates][0]"].map((file) => (0, awsConfig_1.uploadImage)(file.filepath));
            const uploadResults = yield Promise.all(filePaths);
            const profilePicture = yield (0, awsConfig_1.uploadImage)(images["values[profileImage]"][0].filepath);
            const createDb = yield licence_1.Licence.create({
                applicantName: datas["values[applicantName]"][0],
                businessName: datas["values[businessName]"][0],
                certificateExpirationDate: datas["values[certificateExpirationDate]"][0],
                emailAddress: datas["values[emailAddress]"][0],
                phoneNumber: datas["values[phoneNumber]"][0],
                location: datas["values[location]"][0],
                upiIdOrPhoneNumber: datas["values[upiIdOrPhoneNumber]"][0],
                accountNumber: datas["values[accountNumber]"][0],
                services: datas["values[servicesYouChose]"][0],
                description: datas["values[whatWillYouSell]"][0],
                licence: uploadResults,
                vendorId: datas.id[0],
                profilePicture: profilePicture,
            });
            if (createDb) {
                return { success: true, message: "Request created successfully" };
            }
            else {
                return { success: false, message: "something went wrong" };
            }
        }
        catch (error) {
            console.log(error);
        }
    }),
    listRequestsForVendor: (vendorId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const requests = yield requests_1.Request.find({ vendorId });
            const userIds = requests.map((request) => request.userId.toString());
            const users = yield user_1.Users.find({
                _id: { $in: userIds },
            });
            const userMap = users.reduce((acc, user) => {
                acc[user._id] = user;
                return acc;
            }, {});
            const combinedData = requests.map((request) => {
                const user = userMap[request.userId.toString()];
                return {
                    userName: user.userName,
                    userProfilePicture: user.profilePicture,
                    userId: request.userId,
                    requested: request.requested,
                };
            });
            return combinedData;
        }
        catch (error) {
            console.error(error);
            throw error;
        }
    }),
    acceptRequest: (userId, vendorId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let chat = yield chatModal_1.default.findOneAndUpdate({
                users: { $all: [userId, vendorId] },
            }, { $set: { is_accepted: true } });
            return { success: true };
        }
        catch (error) {
            console.error(error);
        }
    }),
    rejectRequest: (_id) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const data = yield chatModal_1.default.findByIdAndDelete(_id);
            return { success: true };
        }
        catch (error) {
            console.log(error);
        }
    }),
    fetchMessages: (chatId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const messages = yield message_1.default.find({ chat: chatId }).sort({
                createdAt: 1,
            });
            return messages;
        }
        catch (error) {
            console.log(error);
        }
    }),
    storeMessage: (data) => __awaiter(void 0, void 0, void 0, function* () {
        // const { vendorId, userId, content } = data;
        // try {
        //   let chat = await ChatModel.findOne({
        //     users: { $all: [vendorId, userId] },
        //   });
        //   if (!chat) {
        //     chat = new ChatModel({
        //       users: [vendorId, userId],
        //     });
        //     await chat.save();
        //   }
        //   const newMessage = new Message({
        //     sender: vendorId,
        //     senderModel: 'Vendor',
        //     content,
        //     chat: chat._id,
        //   });
        //   const savedMessage = await newMessage.save();
        //   chat.latestMessage = savedMessage._id;
        //   await chat.save();
        //   console.log(savedMessage, "Message stored successfully");
        //   io.to(`user:${userId}`).emit('receive message', { sender: 'Vendor', content });
        //   io.to(`vendor:${vendorId}`).emit('receive message', { sender: 'You', content });
        // } catch (error) {
        //   console.error('Error storing message:', error);
        //   throw new Error('Internal server error');
        // }
    }),
    fetchChatId: (vendorId, userId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const chat = yield chatModal_1.default.findOne({
                $and: [{ users: userId }, { users: vendorId }],
            });
            if (chat !== null) {
                return chat._id.toString();
            }
            else {
                throw new Error("Chat not found");
            }
        }
        catch (error) {
            console.log(error);
        }
    }),
    getBookings: (vendorId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const bookings = yield booking_1.Bookings.find({ vendorId }).lean();
            return bookings;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }),
    cancelBooking: (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const booking = yield booking_1.Bookings.findById(bookingId);
            if (!booking) {
                throw new Error("Booking not found");
            }
            yield user_1.Users.findByIdAndUpdate(booking.userId, { $inc: { wallet: booking.advance } }, { new: true });
            yield booking_1.Bookings.findByIdAndDelete(bookingId);
            return { success: true };
        }
        catch (error) {
            console.error("Error canceling booking:", error);
        }
    }),
    acceptBooking: (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Find and update the booking to accepted
            const updatedBooking = yield booking_1.Bookings.findByIdAndUpdate(bookingId, { $set: { accepted: true } }, { new: true });
            if (!updatedBooking) {
                throw new Error("Booking not found");
            }
            const updateVendor = yield vendor_1.Vendors.findByIdAndUpdate(updatedBooking.vendorId, {
                $inc: {
                    wallet: updatedBooking.advance,
                },
            }, { new: true });
            if (!updateVendor) {
                throw new Error("Vendor not found");
            }
            return updatedBooking;
        }
        catch (error) {
            console.error("Error accepting booking:", error);
            throw error;
        }
    }),
    getProfile: (vendorId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const vendor = yield vendor_1.Vendors.findById(vendorId)
                .populate("posts")
                .populate("licence");
            if (!vendor) {
                throw new Error("Vendor not found");
            }
            const postsWithCounts = vendor.posts
                ? yield Promise.all(vendor.posts.map((post) => __awaiter(void 0, void 0, void 0, function* () {
                    const commentsCount = yield comment_1.Comment.countDocuments({
                        postId: post._id,
                    });
                    const repliesCount = yield comment_1.Reply.countDocuments({
                        postId: post._id,
                    });
                    return Object.assign(Object.assign({}, post._doc), { likesCount: post.likes.length, commentsCount: commentsCount + repliesCount });
                })))
                : [];
            const datas = {
                vendorName: vendor.vendorName,
                email: vendor.email,
                phoneNum: vendor.phoneNum,
                profilePicture: vendor.profilePicture,
                coverPicture: vendor.coverPicture,
                verified: vendor.verified,
                blocked: vendor.blocked,
                posts: postsWithCounts,
                licence: vendor.licence,
                registered: vendor.registered,
                about: vendor.about,
            };
            return datas;
        }
        catch (error) {
            console.error(error);
            throw new Error("Failed to fetch vendor profile");
        }
    }),
    updateVendor: (vendorId, datas, files) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let profile, cover;
            if (files.profilePicture) {
                profile = yield (0, awsConfig_1.uploadImage)(files.profilePicture[0].filepath);
            }
            if (files.coverPicture) {
                cover = yield (0, awsConfig_1.uploadImage)(files.coverPicture[0].filepath);
            }
            const updateData = {
                vendorName: datas.name,
                phoneNum: datas.phoneNum,
                about: datas.about,
            };
            if (profile) {
                updateData.profilePicture = profile;
            }
            if (cover) {
                updateData.coverPicture = cover;
            }
            yield vendor_1.Vendors.findByIdAndUpdate(vendorId, {
                $set: updateData,
            });
            return { success: true, profile };
        }
        catch (error) {
            console.log(error);
            return { success: false, error };
        }
    }),
    getDates: (vendorId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const vendor = yield vendor_1.Vendors.findById(vendorId);
            const dates = vendor === null || vendor === void 0 ? void 0 : vendor.availableDate;
            return dates;
        }
        catch (error) {
            console.log(error);
        }
    }),
    updateDates: (vendorId, date) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const vendors = yield vendor_1.Vendors.findById(vendorId);
            if (vendors) {
                vendors.availableDate = [...new Set([...date])];
                yield vendors.save();
            }
            return { success: true };
        }
        catch (error) {
            console.log(error);
        }
    }),
    updateBooking: (bookingId, status) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log(bookingId, status);
            const data = yield booking_1.Bookings.findById(bookingId);
            if (data) {
                data.status = status;
                yield data.save();
                console.log("Status updated successfully");
                return true;
            }
        }
        catch (error) {
            console.log(error);
        }
    }),
    billing: (datas, bookingId, totalAmount) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const booking = yield booking_1.Bookings.aggregate([
                {
                    $match: {
                        _id: new mongoose_1.default.Types.ObjectId(bookingId),
                        status: { $in: ["Completed", "Cancelled"] },
                    },
                },
            ]);
            if (booking.length === 0) {
                return { success: false, message: "Booking not found" };
            }
            yield billing_1.default.create({
                totalAmount,
                bookingId,
                items: datas,
                userId: booking[0].userId,
                vendorId: booking[0].vendorId,
            });
            return { success: true };
        }
        catch (error) {
            console.log(error);
        }
    }),
    notification: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const response = yield user_1.Users.findById(userId);
            return {
                userName: response === null || response === void 0 ? void 0 : response.userName,
                profilePicture: response === null || response === void 0 ? void 0 : response.profilePicture,
            };
        }
        catch (error) {
            console.log(error);
        }
    }),
    room: (venorId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const data = yield chatModal_1.default.find({ users: venorId });
            const ids = data.map((item) => item._id + "");
            return ids;
        }
        catch (error) {
            console.log(error);
        }
    }),
    review: (vendorId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const vendor = yield vendor_1.Vendors.findById(vendorId).populate({
                path: "ratingAndReview.userId",
                select: "userName profilePicture",
            });
            return vendor === null || vendor === void 0 ? void 0 : vendor.ratingAndReview;
        }
        catch (error) {
            console.log(error);
        }
    }),
    wallet: (vendorId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            return yield vendor_1.Vendors.findById(vendorId).select("wallet");
        }
        catch (error) {
            console.log(error);
        }
    }),
    enquerys: (vendorId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const currentDate = new Date();
            const twoMonthsAgo = new Date();
            twoMonthsAgo.setMonth(currentDate.getMonth() - 2);
            const unreadData = yield helpUser_1.HelpUsers.find({
                vendorReaded: { $nin: [vendorId] },
                createdAt: { $gte: twoMonthsAgo },
            }).sort({ createdAt: -1 });
            return unreadData;
        }
        catch (error) {
            console.log(error);
        }
    }),
    readEnquery: (enqId, vendorId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const readData = yield helpUser_1.HelpUsers.findByIdAndUpdate(enqId, { $push: { vendorReaded: vendorId } }, { new: true });
            return readData ? true : false;
        }
        catch (error) {
            console.log(error);
            return false;
        }
    }),
    counts: () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const user = yield user_1.Users.find();
            const vendor = yield vendor_1.Vendors.find();
            const events = yield booking_1.Bookings.find({ status: "Completed" });
            return {
                userCount: user.length,
                vendorCount: vendor.length,
                eventsCount: events.length,
            };
        }
        catch (error) {
            console.log(error);
        }
    }),
    postData: (postId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const comments = yield comment_1.Comment.find({ postId })
                .populate({
                path: "userId",
                select: "profilePicture userName",
            })
                .populate({ path: "replies", select: "comment likes" });
            return comments;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    }),
    deletePost: (postId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const update = yield post_1.Posts.findByIdAndDelete(postId);
            if (update) {
                return true;
            }
        }
        catch (error) {
            console.log(error);
        }
    }),
};
const fetchUsers = (vendorId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chats = yield chatModal_1.default.find({ users: vendorId });
        const userId = chats
            .map((chat) => chat.users.find((user) => user.toString() !== vendorId))
            .filter(Boolean);
        const sortedVendorMessages = yield message_1.default.find({
            senderModel: "User",
            sender: { $in: userId },
        }).sort({ createdAt: -1 });
        const uniqueUserId = [
            ...new Set(sortedVendorMessages.map((message) => message.sender.toString())),
        ];
        const sortedUsers = yield user_1.Users.find({ _id: { $in: uniqueUserId } })
            .select("_id userName profilePicture")
            .then((users) => uniqueUserId.map((id) => users.find((user) => user._id.toString() === id)));
        return sortedUsers;
    }
    catch (error) {
        console.error("Error fetching users:", error);
        throw error;
    }
});
exports.fetchUsers = fetchUsers;
