
const router = require("express").Router();
const Post = require("../models/Post");
const Category = require("../models/Category");
const verifyToken = require("../middleware/verifytoken")
//CREATE POST
router.post("/", verifyToken, async (req, res) => {
  const newPost = new Post(req.body);
  try {
    // Save the new post
    const savedPost = await newPost.save();

    // Handle categories
    const categories = req.body.categories;

    if (categories && categories.length > 0) {
      for (let categoryName of categories) {
        categoryName = categoryName.trim(); // Trim category name
        const existingCategory = await Category.findOne({ name: categoryName });
        if (!existingCategory) {
          const newCategory = new Category({ name: categoryName });
          await newCategory.save();
        }
      }
    }

    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE POST
router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.username === req.body.username) {
      try {
        const updatedData = { ...req.body };

        const updatedPost = await Post.findByIdAndUpdate(
          req.params.id,
          {
            $set: updatedData,
          },
          { new: true }
        );
        res.status(200).json(updatedPost);
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(401).json("You can update only your post!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE POST
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post.username === req.body.username) {
      try {
        await post.delete();
        res.status(200).json("Post has been deleted...");
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(401).json("You can delete only your post!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET POST
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL POSTS
router.get("/", async (req, res) => {
  const username = req.query.user;
  const catName = req.query.cat;
  try {
    let posts;
    if (username) {
      posts = await Post.find({ username });
    } else if (catName) {
      posts = await Post.find({
        categories: {
          $in: [catName],
        },
      });
    } else {
      posts = await Post.find();
    }
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
