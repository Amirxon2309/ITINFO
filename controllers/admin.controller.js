const { mongo, default: mongoose } = require("mongoose");
const { errorHandler } = require("../helpers/error_handler");
const Admin = require("../schemas/Admin");
const { adminValidation } = require("../validations/admin.validation");
const bcrypt = require("bcrypt");
const adminJwt = require("../services/jwt_service");
const { to } = require("../helpers/to_promise");
const config = require("config");
const addAdmin = async (req, res) => {
  try {
    const { error, value } = adminValidation(req.body);
    console.log(value);

    if (error) {
      return errorHandler(error, res);
    }
    const oldAdmin = await Admin.findOne({
      admin_email: value.admin_email,
    });
    if (oldAdmin) {
      return res.status(400).send({ message: "This admin already exists" });
    }

    const hashedPassword = bcrypt.hashSync(value.admin_password, 7);

    const newAdmin = await Admin.create({
      ...value,
      admin_password: hashedPassword,
    });
    res.status(201).send({ message: "New admin added", newAdmin });
  } catch (error) {
    errorHandler(error, res);
  }
};

const loginAdmin = async (req, res) => {
  try {
    const { admin_email, admin_password } = req.body;
    const admin = await Admin.findOne({ admin_email });
    if (!admin) {
      return res.status(401).send({ message: "Email yoki parol noto'g'ri" });
    }
    const validPassword = bcrypt.compareSync(
      admin_password,
      admin.admin_password
    );
    if (!validPassword) {
      return res.status(401).send({ message: "Email yoki parol noto'g'ri" });
    }

    const payload = {
      id: admin._id,
      email: admin.admin_email,
      admin_is_active: admin.admin_is_active,
      admin_is_creator: admin.admin_is_creator,
    };

    const tokens = adminJwt.generateTokens(payload);
    admin.refresh_token = tokens.refreshToken;
    await admin.save();
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("refresh_token_ms"),
    });

    res.status(200).send({ message: "Tizimga xush kelibsiz", ...tokens });
  } catch (error) {
    errorHandler(error, res);
  }
};

const logoutAdmin = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    console.log(refreshToken);
    if (!refreshToken) {
      return res.status(400).send({ message: "token topilmadi" });
    }
    const admin = await Admin.findOneAndUpdate(
      { refresh_token: refreshToken },
      { refresh_token: "" },
      { new: true }
    );
    if (!admin) {
      return res.status(400).send({ message: "Bunday tokenli admin yo'q" });
    }
    res.clearCookie("refreshToken");
    res.send({ refreshToken: admin.refresh_token });
  } catch (error) {
    errorHandler(error, res);
  }
};

const refreshAdminToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(400).send({ message: "token topilmadi" });
    }
    const { error, tokenFromCookie } = await to(
      adminJwt.verifyRefreshToken(refreshToken)
    );
    if (error) {
      return res.status(401).send({ error: error.message });
    }
    const admin = await Admin.findOne({ refresh_token: refreshToken });
    if (!admin) {
      return res.status(404).send({ message: "Admin not found" });
    }

    const payload = {
      id: admin._id,
      email: admin.admin_email,
      admin_is_active: admin.admin_is_active,
      admin_is_creator: admin.admin_is_creator,
    };

    const tokens = adminJwt.generateTokens(payload);
    admin.refresh_token = tokens.refreshToken;
    await admin.save();
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      maxAge: config.get("refresh_token_ms"),
    });

    res.status(200).send({
      message: "Tizimga xush kelibsiz",
      accesstoken: tokens.accessToken,
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    const admin = await req.body.admin;
    res.send({
      admins,
      admin,
    });
  } catch (error) {
    errorHandler(error, res);
  }
};

const getAdminsByNameQuery = async (req, res) => {
  try {
    const searchQuery = req.query;
    const admins = await Admin.find({
      admin_name: new RegExp(searchQuery.name, "i"),
    }).populate("parent_admin_id", "-_id");
    res.send({ admins });
  } catch (error) {
    errorHandler(error, res);
  }
};

const deleteAdminById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({ message: "ID noto'g'ri" });
    }
    const admin = await Admin.deleteOne({ _id: id });
    console.log(admin);
    res.send(admin);
  } catch (error) {
    errorHandler(error, res);
  }
};

const updateAdminById = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      admin_name,
      admin_email,
      admin_phone,
      admin_password,
      admin_is_active,
      admin_is_creator,
    } = req.body;
    const newAdmin = await Admin.updateOne(
      { _id: id },
      {
        $set: {
          admin_name,
          admin_email,
          admin_phone,
          admin_password,
          admin_is_active,
          admin_is_creator,
        },
      }
    );
    res.send({ message: "Admin updated successfully", newAdmin });
  } catch (error) {
    errorHandler(error, res);
  }
};

const getAdminById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).send({ message: "ID noto'g'ri" });
    }
    const admin = await Admin.findOne({ _id: id });
    if (!admin) {
      return res.status(400).send({ message: "Bunday admin mavjud emas" });
    }
    res.send({ admin });
  } catch (error) {
    errorHandler(error, res);
  }
};

module.exports = {
  addAdmin,
  getAdmins,
  deleteAdminById,
  updateAdminById,
  getAdminById,
  loginAdmin,
  logoutAdmin,
  refreshAdminToken,
};
