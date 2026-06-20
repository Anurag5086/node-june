const blogData = [
  {
    "id": 1,
    "title": "Getting Started with Node.js",
    "content": "Node.js allows developers to build scalable server-side applications using JavaScript. It provides a non-blocking event-driven architecture that makes it highly efficient.",
    "author": "Anurag Gupta",
    "category": "Programming"
  },
  {
    "id": 2,
    "title": "Understanding Express Middleware",
    "content": "Middleware functions in Express execute during the request-response cycle and are commonly used for logging, authentication, and error handling.",
    "author": "Rahul Sharma",
    "category": "Programming"
  },
  {
    "id": 3,
    "title": "Benefits of Morning Exercise",
    "content": "Exercising in the morning improves metabolism, boosts energy levels, and helps maintain a healthy routine throughout the day.",
    "author": "Priya Verma",
    "category": "Health"
  },
  {
    "id": 4,
    "title": "Top 10 Places to Visit in India",
    "content": "India offers diverse destinations ranging from the Himalayas to the beaches of Goa and the backwaters of Kerala.",
    "author": "Rohan Singh",
    "category": "Travel"
  },
  {
    "id": 5,
    "title": "Introduction to REST APIs",
    "content": "REST APIs follow architectural principles that enable communication between clients and servers using standard HTTP methods.",
    "author": "Anurag Gupta",
    "category": "Programming"
  },
  {
    "id": 6,
    "title": "Healthy Eating Habits",
    "content": "A balanced diet rich in fruits, vegetables, proteins, and whole grains can significantly improve overall health and well-being.",
    "author": "Sneha Kapoor",
    "category": "Health"
  },
  {
    "id": 7,
    "title": "Exploring the Mountains of Himachal",
    "content": "Himachal Pradesh is known for its scenic beauty, adventure sports, and peaceful hill stations like Manali and Shimla.",
    "author": "Amit Mehta",
    "category": "Travel"
  },
  {
    "id": 8,
    "title": "What is MVC Architecture?",
    "content": "MVC stands for Model-View-Controller. It separates application logic into three components, improving maintainability and scalability.",
    "author": "Anurag Gupta",
    "category": "AI"
  },
  {
    "id": 9,
    "title": "Importance of Sleep for Productivity",
    "content": "Adequate sleep enhances focus, memory retention, and overall productivity while reducing stress and fatigue.",
    "author": "Priya Verma",
    "category": "Health"
  },
  {
    "id": 10,
    "title": "A Beginner's Guide to MongoDB",
    "content": "MongoDB is a NoSQL database that stores data in flexible JSON-like documents, making it suitable for modern applications.",
    "author": "Rahul Sharma",
    "category": "Programming"
  },
  {
    "id": 11,
    "title": "Best Beaches Around the World",
    "content": "From the Maldives to Bali, beaches around the world offer stunning views and unforgettable experiences.",
    "author": "Rohan Singh",
    "category": "Travel"
  },
  {
    "id": 12,
    "title": "Why TypeScript is Gaining Popularity",
    "content": "TypeScript provides static typing, improved tooling, and better maintainability, making it a preferred choice for large-scale applications.",
    "author": "Anurag Gupta",
    "category": "AI"
  },
  {
    "id": 13,
    "title": "Meditation for Mental Wellness",
    "content": "Daily meditation helps reduce stress, improve concentration, and promote emotional well-being.",
    "author": "Sneha Kapoor",
    "category": "Health"
  },
  {
    "id": 14,
    "title": "Understanding JavaScript Closures",
    "content": "Closures allow functions to retain access to variables from their lexical scope even after the outer function has finished execution.",
    "author": "Rahul Sharma",
    "category": "Programming"
  },
  {
    "id": 15,
    "title": "Tips for Solo Travelers",
    "content": "Planning ahead, staying connected, and being aware of local customs can make solo travel safe and enjoyable.",
    "author": "Amit Mehta",
    "category": "Travel"
  }
]

exports.getAllBlogs = (req, res) => {
    let filteredBlogs = blogData

    if(req.query.author){
        const author = req.query.author
        filteredBlogs = filteredBlogs.filter(blog => blog.author.toLowerCase() === author.toLowerCase())
    }

    if(req.query.category){
        const category = req.query.category
        filteredBlogs = filteredBlogs.filter(blog => blog.category.toLowerCase() === category.toLowerCase())
    }

    res.status(200).json({ success: true, message: "Successfully fetched all blogs!", blogs: filteredBlogs})
}

exports.getBlogById = (req, res) => {
  const blogId = parseInt(req.params.id)
  blogData[0].category = "Nodejs"
  const blogPost = blogData.find(blog => blog.id === blogId)

  if(!blogPost){
    res.status(404).json({ success: false, message: "Blog post not found!" })
  }

  res.status(200).json({ success: true, message: "Successfully fetched blog!", blog: blogPost})
}