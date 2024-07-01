const router = require("express").Router();
const Post = require("../models/Post");
const Category = require("../models/Category");
const verifyToken = require("../middleware/verifytoken");

// CREATE POST
router.post("/", verifyToken, async (req, res) => {
  const newPost = new Post({
    username: req.user.username, // Ensure the username is assigned from the authenticated user
    title: req.body.title,
    desc: req.body.desc,
    categories: req.body.categories,
    photo: req.body.photo
  });

  try {
    // Save the new post
    const savedPost = await newPost.save();

    // Handle categories
    const categories = req.body.categories;
    if (categories && categories.length > 0) {
      for (let categoryName of categories) {
        categoryName = categoryName.trim(); // Trim category name
        let existingCategory = await Category.findOne({ name: categoryName });
        if (!existingCategory) {
          const newCategory = new Category({ name: categoryName });
          existingCategory = await newCategory.save();
        }
        // Ensure the category is associated with the post
        if (!savedPost.categories.includes(existingCategory._id)) {
          savedPost.categories.push(existingCategory._id);
        }
      }
      await savedPost.save();
    }

    res.status(200).json(savedPost);
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err });
  }
});

// UPDATE POST
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    console.log('Post username:', post.username);
    console.log('User username:', req.user.username);

    if (post.username === req.user.username) {
      if (req.body.categories) {
        const categories = req.body.categories.map((cat) => cat.trim());
        req.body.categories = categories;
      }

      const updatedPost = await Post.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );
      res.status(200).json(updatedPost);
    } else {
      res.status(401).json("You can update only your post!");
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err });
  }
});

// DELETE POST
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    console.log('Post username:', post.username);
    console.log('User username:', req.user.username);

    if (post.username === req.user.username) {
      await post.delete();
      res.status(200).json("Post has been deleted...");
    } else {
      res.status(401).json("You can delete only your post!");
    }
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err });
  }
});

// GET POST
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ message: "Internal server error", error: err });
  }
});

// GET ALL POSTS
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
    res.status(500).json({ message: "Internal server error", error: err });
  }
});

module.exports = router;
