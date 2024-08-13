import { Vendors } from "../../framworks/database/models/vendor";
import { IVendorDetails } from "../entities/vendor/vendor";
import { CreateUserResponse } from "../repositories/user/authRepositories";



export const checkingVendor = async (data: IVendorDetails): Promise<CreateUserResponse> => {
  try {
    const userWithEmail = await Vendors.findOne({ email: data.email });
    const userWithPhoneNum = await Vendors.findOne({ phoneNum: data.phoneNum });

    if (userWithEmail) {
      return { success: false, message: "Email already exists" };
    }

    if (userWithPhoneNum) {
      return { success: false, message: "Phone number already exists" };
    }

    return <CreateUserResponse>{ success: true };
  } catch (error) {
    console.error(error);
    return <CreateUserResponse>{ success: false, message: "An error occurred while checking user data" };
  }
};
