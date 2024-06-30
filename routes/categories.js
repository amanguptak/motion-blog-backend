const router = require("express").Router();
const Category = require("../models/Category");

// Create a new category
router.post("/", async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ message: "Category name is required" });
    }
    const newCat = new Category(req.body);
    const savedCat = await newCat.save();
    res.status(200).json(savedCat);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save category", error: err });
  }
});

// Get all categories
router.get("/", async (req, res) => {
  try {
    const cats = await Category.find();
    res.status(200).json(cats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch categories", error: err });
  }
});

module.exports = router;
