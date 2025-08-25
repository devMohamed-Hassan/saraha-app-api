import { decrypt } from "../../utils/crypto.js";
import { handleSuccess } from "../../utils/responseHandler.js";


export const getUserProfile = async (req, res, next) => {
  const user = req.user;
  user.phone = decrypt(user.phone);
  handleSuccess({
    res,
    statusCode: 200,
    message: "success",
    data: user,
  });
};
