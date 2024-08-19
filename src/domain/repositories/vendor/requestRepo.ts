import { uploadImage } from "../../../config/awsConfig";
import ChatModel from "../../../framworks/database/models/chatModal";
import { Licence } from "../../../framworks/database/models/licence";
import Message from "../../../framworks/database/models/message";
import { Request } from "../../../framworks/database/models/requests";
import { Users } from "../../../framworks/database/models/user";
import { Vendors } from "../../../framworks/database/models/vendor";
import { IUser } from "../../entities/user/user";
import io from "socket.io-client";

import {
  IAcceptRequest,
  IBookingStatus,
  IReq,
  IReqVendor,
  IRequestWithUser,
  IUserReq,
  MessageData,
} from "../../entities/vendor/vendor";
import { Bookings } from "../../../framworks/database/models/booking";
import mongoose from "mongoose";
import BillModel from "../../../framworks/database/models/billing";
import { HelpUsers } from "../../../framworks/database/models/helpUser";
import { Comment, Reply } from "../../../framworks/database/models/comment";
import { Posts } from "../../../framworks/database/models/post";

export default {
  addRequest: async (datas: any, images: any) => {
    try {
      const filePaths = images["values[licenseOrCertificates][0]"].map(
        (file: any) => uploadImage(file.filepath)
      );

      const uploadResults = await Promise.all(filePaths);
      const profilePicture = await uploadImage(
        images["values[profileImage]"][0].filepath
      );

      const createDb = await Licence.create({
        applicantName: datas["values[applicantName]"][0],
        businessName: datas["values[businessName]"][0],
        certificateExpirationDate:
          datas["values[certificateExpirationDate]"][0],
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
      } else {
        return { success: false, message: "something went wrong" };
      }
    } catch (error) {
      console.log(error);
    }
  },

  listRequestsForVendor: async (vendorId: string) => {
    try {
      const requests = await Request.find({ vendorId });

      const userIds: string[] = requests.map((request) =>
        request.userId.toString()
      );
      const users: IUserReq[] = await Users.find({
        _id: { $in: userIds },
      });

      const userMap: { [key: string]: IUser } = users.reduce(
        (acc: { [key: string]: IUser }, user) => {
          acc[user._id] = user;
          return acc;
        },
        {}
      );

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
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  acceptRequest: async (userId: string, vendorId: string) => {
    try {
      let chat = await ChatModel.findOneAndUpdate(
        {
          users: { $all: [userId, vendorId] },
        },
        { $set: { is_accepted: true } }
      );

      return { success: true };
    } catch (error) {
      console.error(error);
    }
  },
  rejectRequest: async (_id: string) => {
    try {
      const data = await ChatModel.findByIdAndDelete(_id);
      return { success: true };
    } catch (error) {
      console.log(error);
    }
  },

  fetchMessages: async (chatId: string) => {
    try {
      const messages = await Message.find({ chat: chatId }).sort({
        createdAt: 1,
      });
      return messages;
    } catch (error) {
      console.log(error);
    }
  },
  storeMessage: async (data: MessageData): Promise<void> => {
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
  },
  fetchChatId: async (vendorId: string, userId: string) => {
    try {
      const chat = await ChatModel.findOne({
        $and: [{ users: userId }, { users: vendorId }],
      });

      if (chat !== null) {
        return chat._id.toString();
      } else {
        throw new Error("Chat not found");
      }
    } catch (error) {
      console.log(error);
    }
  },
  getBookings: async (vendorId: string) => {
    try {
      const bookings = await Bookings.find({ vendorId }).lean();

      return bookings;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  cancelBooking: async (bookingId: string) => {
    try {
      const booking = await Bookings.findById(bookingId);

      if (!booking) {
        throw new Error("Booking not found");
      }

      await Users.findByIdAndUpdate(
        booking.userId,
        { $inc: { wallet: booking.advance } },
        { new: true }
      );

      await Bookings.findByIdAndDelete(bookingId);

      return { success: true };
    } catch (error) {
      console.error("Error canceling booking:", error);
    }
  },
  acceptBooking: async (bookingId: string) => {
    try {
      // Find and update the booking to accepted
      const updatedBooking = await Bookings.findByIdAndUpdate(
        bookingId,
        { $set: { accepted: true } },
        { new: true }
      );

      if (!updatedBooking) {
        throw new Error("Booking not found");
      }

      const updateVendor = await Vendors.findByIdAndUpdate(
        updatedBooking.vendorId,
        {
          $inc: {
            wallet: updatedBooking.advance,
          },
        },
        { new: true }
      );

      if (!updateVendor) {
        throw new Error("Vendor not found");
      }
      return updatedBooking;
    } catch (error) {
      console.error("Error accepting booking:", error);
      throw error;
    }
  },
  getProfile: async (vendorId: string) => {
    try {
      const vendor = await Vendors.findById(vendorId)
        .populate("posts")
        .populate("licence");

      if (!vendor) {
        throw new Error("Vendor not found");
      }

      const postsWithCounts = vendor.posts
        ? await Promise.all(
            vendor.posts.map(async (post: any) => {
              const commentsCount = await Comment.countDocuments({
                postId: post._id,
              });
              const repliesCount = await Reply.countDocuments({
                postId: post._id,
              });
              return {
                ...post._doc,
                likesCount: post.likes.length,
                commentsCount: commentsCount + repliesCount,
              };
            })
          )
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
    } catch (error) {
      console.error(error);
      throw new Error("Failed to fetch vendor profile");
    }
  },

  updateVendor: async (vendorId: string, datas: any, files: any) => {
    try {
      let profile, cover;

      if (files.profilePicture) {
        profile = await uploadImage(files.profilePicture[0].filepath);
      }

      if (files.coverPicture) {
        cover = await uploadImage(files.coverPicture[0].filepath);
      }

      const updateData: any = {
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

      await Vendors.findByIdAndUpdate(vendorId, {
        $set: updateData,
      });

      return { success: true, profile };
    } catch (error) {
      console.log(error);
      return { success: false, error };
    }
  },
  getDates: async (vendorId: string) => {
    try {
      const vendor = await Vendors.findById(vendorId);
      const dates = vendor?.availableDate;
      return dates;
    } catch (error) {
      console.log(error);
    }
  },
  updateDates: async (vendorId: string, date: []) => {
    try {
      const vendors = await Vendors.findById(vendorId);
      if (vendors) {
        vendors.availableDate = [...new Set([...date])];
        await vendors.save();
      }
      return { success: true };
    } catch (error) {
      console.log(error);
    }
  },
  updateBooking: async (bookingId: string, status: string) => {
    try {
      console.log(bookingId, status);
      const data = await Bookings.findById(bookingId);
      if (data) {
        data.status = status;
        await data.save();
        console.log("Status updated successfully");
        return true;
      }
    } catch (error) {
      console.log(error);
    }
  },
  billing: async (
    datas: { item: string; amount: string }[],
    bookingId: string,
    totalAmount: number
  ) => {
    try {
      const booking = await Bookings.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(bookingId),
            status: { $in: ["Completed", "Cancelled"] },
          },
        },
      ]);
      if (booking.length === 0) {
        return { success: false, message: "Booking not found" };
      }
      await BillModel.create({
        totalAmount,
        bookingId,
        items: datas,
        userId: booking[0].userId,
        vendorId: booking[0].vendorId,
      });
      return { success: true };
    } catch (error) {
      console.log(error);
    }
  },
  notification: async (userId: string) => {
    try {
      const response = await Users.findById(userId);
      return {
        userName: response?.userName,
        profilePicture: response?.profilePicture,
      };
    } catch (error) {
      console.log(error);
    }
  },
  room: async (venorId: string) => {
    try {
      const data = await ChatModel.find({ users: venorId });
      const ids = data.map((item) => item._id + "");
      return ids;
    } catch (error) {
      console.log(error);
    }
  },
  review: async (vendorId: string) => {
    try {
      const vendor = await Vendors.findById(vendorId).populate({
        path: "ratingAndReview.userId",
        select: "userName profilePicture",
      });
      return vendor?.ratingAndReview;
    } catch (error) {
      console.log(error);
    }
  },
  wallet: async (vendorId: string) => {
    try {
      return await Vendors.findById(vendorId).select("wallet");
    } catch (error) {
      console.log(error);
    }
  },
  enquerys: async (vendorId: string) => {
    try {
      const currentDate = new Date();
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(currentDate.getMonth() - 2);
      const unreadData = await HelpUsers.find({
        vendorReaded: { $nin: [vendorId] },
        createdAt: { $gte: twoMonthsAgo },
      }).sort({ createdAt: -1 });
      return unreadData;
    } catch (error) {
      console.log(error);
    }
  },
  readEnquery: async (enqId: string, vendorId: string) => {
    try {
      const readData = await HelpUsers.findByIdAndUpdate(
        enqId,
        { $push: { vendorReaded: vendorId } },
        { new: true }
      );
      return readData ? true : false;
    } catch (error) {
      console.log(error);
      return false;
    }
  },
  counts: async () => {
    try {
      const user = await Users.find();
      const vendor = await Vendors.find();
      const events = await Bookings.find({ status: "Completed" });
      return {
        userCount: user.length,
        vendorCount: vendor.length,
        eventsCount: events.length,
      };
    } catch (error) {
      console.log(error);
    }
  },
  postData: async (postId: string) => {
    try {
      const comments = await Comment.find({ postId })
        .populate({
          path: "userId",
          select: "profilePicture userName",
        })
        .populate({ path: "replies", select: "comment likes" });

      return comments;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  deletePost: async (postId: string) => {
    try {
      const update = await Posts.findByIdAndDelete(postId);
      if (update) {
        return true;
      }
    } catch (error) {
      console.log(error);
    }
  },
};

export const fetchUsers = async (vendorId: string) => {
  try {
    const chats = await ChatModel.find({ users: vendorId });
    const userId = chats
      .map((chat) => chat.users.find((user) => user.toString() !== vendorId))
      .filter(Boolean);
    const sortedVendorMessages = await Message.find({
      senderModel: "User",
      sender: { $in: userId },
    }).sort({ createdAt: -1 });

    const uniqueUserId = [
      ...new Set(
        sortedVendorMessages.map((message) => message.sender.toString())
      ),
    ];

    const sortedUsers = await Users.find({ _id: { $in: uniqueUserId } })
      .select("_id userName profilePicture")
      .then((users) =>
        uniqueUserId.map((id) =>
          users.find((user: any) => user._id.toString() === id)
        )
      );

    return sortedUsers;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
