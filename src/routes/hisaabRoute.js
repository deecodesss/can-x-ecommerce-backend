const e = require("express");
const { fetchHisaab } = require("../controllers/hisaabController");

const router = e.Router();

router.get("/:userId", fetchHisaab);


module.exports = router;
