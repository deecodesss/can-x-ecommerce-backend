const e = require("express");
const { getAllSchemes, getSchemeById, addNewScheme, deleteSchemeByID, addUserReward, getQualifiedUsersForSchemes } = require("../controllers/schemeController");


const router = e.Router();

router.get("/all", getAllSchemes);
router.get("/:id", getSchemeById);
router.post("/add", addNewScheme);
router.delete("/:id", deleteSchemeByID);
router.post("/reward/add", addUserReward);
router.get("/users/qualified", getQualifiedUsersForSchemes)

module.exports = router;
