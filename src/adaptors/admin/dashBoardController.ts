import { Request, Response, NextFunction, response } from "express";
import dashboard from "../../domain/usecases/adimin/dashboard/dashboard";
import { multipartFormSubmission } from "../../domain/helpers/formidable";

export default {
  usersListing: async (req: Request, res: Response) => {
    const response = await dashboard.listUsers(req.body);
    res.status(200).json(response);
  },
  vendorsListing: async (req: Request, res: Response) => {
    const response = await dashboard.listVendors(req.body);
    res.status(200).json(response);
  },
  blockorUnblock: async (req: Request, res: Response) => {
    try {
      const response = await dashboard.blockorUnblock(req.body);
      res.status(200).json(response);
    } catch (error) {
      console.log(error);
    }
  },
  blockorUnblockUser: async (req: Request, res: Response) => {
    try {
      const response = await dashboard.blockorUnblockUser(req.body);
      res.status(200).json(response);
    } catch (error) {
      console.log(error);
    }
  },

  addCategory: async (req: Request, res: Response) => {
    try {
      const { files, fields } = await multipartFormSubmission(req);

      const name = fields?.category?.[0];
      const image = files?.image?.[0];

      const response = await dashboard.addCategory({ name, image });
      if (response?.success) {
        res.status(200).json({
          status: 200,
          message: "category added successfully",
          response,
        });
      } else {
        res.status(201).json({
          status: 201,
          message: "category already exists",
          response: "",
        });
      }
    } catch (error) {
      console.log(error);
    }
  },

  getCategory: async (req: Request, res: Response) => {
    try {
      const categories = await dashboard.getCategory();

      res.status(200).json({ categories });
    } catch (error) {
      console.error("Error fetching categories:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to fetch categories" });
    }
  },
  removeCategory: async (req: Request, res: Response) => {
    try {
      const response = await dashboard.removeCategory(req.body.data);
      if (response.success) {
        res.status(200).json({ response });
      } else {
        res.status(404).json({ response });
      }
    } catch (error) {
      console.error("Error in dashboardController.removeCategory:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  },

  listRequest: async (req: Request, res: Response) => {
    try {
      const response = await dashboard.listRequest();
      res.status(200).json(response);
    } catch (error) {
      console.log(error);
    }
  },
  reject: async (req: Request, res: Response) => {
    try {
      const response = await dashboard.rejectVendor(req.body);
      if (response?.success) {
        res.status(200).json(response);
      } else {
        res.status(400).json(response);
      }
    } catch (error) {
      console.log(error);
    }
  },
  accept: async (req: Request, res: Response) => {
    try {
      const response = await dashboard.acceptVendor(req.body.dataa);
      if (response?.success) {
        res.status(200).json(response);
      } else {
        res.status(400).json(response);
      }
    } catch (error) {
      console.log(error);
    }
  },
  getDashboard: async (req: Request, res: Response) => {
    try {
      const response = await dashboard.getDashboard();
      res.status(200).json(response);
    } catch (error) {
      console.log(error);
    }
  },
  getBookings: async (req: Request, res: Response) => {
    try {
      const response = await dashboard.getBookings();
      res.status(200).json(response);
    } catch (error) {
      console.log(error);
    }
  },

  refundBooking: async (req: Request, res: Response) => {
    try {
      const { bookingId } = req.params;
      const response = await dashboard.refundBooking(bookingId);
      if (response?.success) {
        res.status(200).json(response);
      } else {
        res.status(404).json(response);
      }
    } catch (error) {
      console.log(error);
    }
  },
  bills: async (req: Request, res: Response) => {
    try {
      const response = await dashboard.bills();
      res.status(200).json(response);
    } catch (error) {
      console.log(error);
    }
  },
  reports: async (req: Request, res: Response) => {
    try {
      const response = await dashboard.report();
      res.status(200).json(response);
    } catch (error) {
      console.log(error);
    }
  },
  blockVenodr: async (req: Request, res: Response) => {
    try {
      const response = await dashboard.blockVendor(
        req.params.reportId,
        req.params.vendorId
      );
      if (response?.success) {
        res.status(200).json({ message: "vendor Blocked successfully" });
      } else {
        res.status(404).json({ message: "Somthing Failed to Block" });
      }
    } catch (error) {
      console.log(error);
    }
  },
  readReport: async (req: Request, res: Response) => {
    try {
      const response = await dashboard.readReport(req.params.reportId);
      res.status(200).json({ message: "vendor Read Report successfully" });
    } catch (error) {
      console.log(error);
    }
  },
  booking: async (req: Request, res: Response) => {
    try {
      const response = await dashboard.bookingCount();
      res.status(200).json(response);
    } catch (error) {
      console.log(error);
    }
  },
  readBill: async (req: Request, res: Response) => {
    try {
      await dashboard.readBill(req.params.billId);
      res.status(200).json({ message: "Bill Read successfully" });
    } catch (error) {
      console.log(error);
    }
  },
};
