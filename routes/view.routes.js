const router = require("express").Router();
const { createViewPage } = require("../helpers/create_view_page");

router.get("/", (req, res) => {
  res.render(createViewPage("index"), {
    title: "Asosiy sahifa",
    isHome: true,
  });
});

router.get("/dictionary", (req, res) => {
  res.render(createViewPage("dictionary"), {
    title: "Lug'at sahifa",
    isDictionary: true,
  });
});

router.get("/topic", (req, res) => {
  res.render(createViewPage("topic"), {
    title: "Maqolalar sahifa",
    isTopic: true,
  });
});
router.get("/author", (req, res) => {
  res.render(createViewPage("author"), {
    title: "Yozuvchi sahifa",
    isAuthor: true,
  });
});

router.get("/login", (req, res) => {
  res.render(createViewPage("login"), {
    title: "Login sahifa",
    isLogin: true,
  });
});
router.get("/loginAdmin", (req, res) => {
  res.render(createViewPage("loginAdmin"), {
    title: "Admin Login sahifa",
    isLoginAdmin: true,
  });
});
router.get("/Admin", (req, res) => {
  res.render(createViewPage("Admin"), {
    title: "AdminLarni ko'rish",
    isAdmin: true,
  });
});

module.exports = router;
