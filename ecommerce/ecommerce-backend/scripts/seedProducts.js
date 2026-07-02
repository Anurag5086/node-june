require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') })

const mongoose = require('mongoose')
const Category = require('../models/Category')
const Product = require('../models/Product')

const PRODUCTS_PER_CATEGORY = 20

const categories = [
  {
    title: 'Electronics',
    description: 'Phones, laptops, audio gear, and smart home devices.',
    imageUrl: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
  },
  {
    title: 'Fashion',
    description: 'Clothing, footwear, and accessories for every style.',
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
  },
  {
    title: 'Home & Kitchen',
    description: 'Furniture, cookware, decor, and everyday essentials.',
    imageUrl: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&q=80',
  },
  {
    title: 'Beauty & Personal Care',
    description: 'Skincare, grooming, fragrances, and wellness products.',
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
  },
  {
    title: 'Sports & Fitness',
    description: 'Workout gear, sportswear, and outdoor equipment.',
    imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3431?w=800&q=80',
  },
  {
    title: 'Books',
    description: 'Bestsellers, fiction, non-fiction, and exam prep titles.',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
  },
  {
    title: 'Grocery',
    description: 'Pantry staples, snacks, beverages, and fresh picks.',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
  },
  {
    title: 'Toys & Games',
    description: 'Board games, puzzles, and toys for all ages.',
    imageUrl: 'https://images.unsplash.com/photo-1558060514-8759c4f4c8b0?w=800&q=80',
  },
]

const productCatalog = {
  Electronics: [
    { title: 'Wireless Noise-Cancelling Headphones', brand: 'SoundMax', mrp: 8999, selling: 6499 },
    { title: 'Bluetooth Earbuds Pro', brand: 'SoundMax', mrp: 4999, selling: 3499 },
    { title: 'Smart LED TV 43 inch', brand: 'ViewTech', mrp: 32999, selling: 27999 },
    { title: 'Gaming Laptop 16GB RAM', brand: 'NovaByte', mrp: 89999, selling: 74999 },
    { title: 'Mechanical Keyboard RGB', brand: 'KeyForge', mrp: 5999, selling: 4499 },
    { title: 'Wireless Gaming Mouse', brand: 'KeyForge', mrp: 3499, selling: 2499 },
    { title: 'Portable Power Bank 20000mAh', brand: 'ChargeUp', mrp: 2499, selling: 1799 },
    { title: 'Smart Watch Fitness Tracker', brand: 'FitPulse', mrp: 7999, selling: 5499 },
    { title: 'USB-C Hub 7-in-1', brand: 'ConnectPro', mrp: 3999, selling: 2799 },
    { title: '4K Action Camera', brand: 'LensGo', mrp: 18999, selling: 14999 },
    { title: 'Smart Speaker with Alexa', brand: 'HomeVoice', mrp: 6999, selling: 4999 },
    { title: 'Tablet 10 inch WiFi', brand: 'TabOne', mrp: 24999, selling: 19999 },
    { title: 'Wireless Router Dual Band', brand: 'NetStream', mrp: 4999, selling: 3699 },
    { title: 'External SSD 1TB', brand: 'StoreFast', mrp: 8999, selling: 7499 },
    { title: 'Webcam Full HD', brand: 'ClearView', mrp: 4999, selling: 3299 },
    { title: 'Smart Doorbell Camera', brand: 'SecureHome', mrp: 9999, selling: 7999 },
    { title: 'Electric Kettle 1.8L', brand: 'HeatQuick', mrp: 2499, selling: 1899 },
    { title: 'Air Purifier HEPA', brand: 'PureAir', mrp: 14999, selling: 11999 },
    { title: 'Robot Vacuum Cleaner', brand: 'CleanBot', mrp: 24999, selling: 19999 },
    { title: 'Portable Bluetooth Speaker', brand: 'SoundMax', mrp: 3999, selling: 2799 },
  ],
  Fashion: [
    { title: 'Classic Cotton T-Shirt', brand: 'UrbanFit', mrp: 999, selling: 599 },
    { title: 'Slim Fit Denim Jeans', brand: 'DenimCo', mrp: 2499, selling: 1799 },
    { title: 'Running Sneakers', brand: 'StrideX', mrp: 4999, selling: 3499 },
    { title: 'Leather Casual Belt', brand: 'CraftLeather', mrp: 1499, selling: 999 },
    { title: 'Formal Oxford Shirt', brand: 'OfficeWear', mrp: 1999, selling: 1399 },
    { title: 'Hooded Sweatshirt', brand: 'UrbanFit', mrp: 2499, selling: 1699 },
    { title: 'Summer Floral Dress', brand: 'BloomStyle', mrp: 2999, selling: 2199 },
    { title: 'Wool Blend Blazer', brand: 'OfficeWear', mrp: 5999, selling: 4499 },
    { title: 'Canvas Sneakers', brand: 'StrideX', mrp: 2499, selling: 1799 },
    { title: 'Leather Crossbody Bag', brand: 'CraftLeather', mrp: 3999, selling: 2799 },
    { title: 'Polarized Sunglasses', brand: 'SunShield', mrp: 1999, selling: 1299 },
    { title: 'Sports Track Pants', brand: 'ActiveLine', mrp: 1799, selling: 1199 },
    { title: 'Cashmere Scarf', brand: 'WarmWeave', mrp: 2499, selling: 1799 },
    { title: 'Ankle Boots', brand: 'StepUp', mrp: 4499, selling: 3299 },
    { title: 'Linen Kurta Set', brand: 'Ethniq', mrp: 3499, selling: 2499 },
    { title: 'Sports Cap', brand: 'ActiveLine', mrp: 799, selling: 499 },
    { title: 'Quilted Winter Jacket', brand: 'WarmWeave', mrp: 5999, selling: 4299 },
    { title: 'Silk Saree', brand: 'Ethniq', mrp: 7999, selling: 5999 },
    { title: 'Leather Wallet', brand: 'CraftLeather', mrp: 1499, selling: 999 },
    { title: 'Graphic Print Hoodie', brand: 'UrbanFit', mrp: 2799, selling: 1999 },
  ],
  'Home & Kitchen': [
    { title: 'Non-Stick Cookware Set 5-Piece', brand: 'ChefMate', mrp: 4999, selling: 3499 },
    { title: 'Memory Foam Pillow', brand: 'SleepWell', mrp: 1999, selling: 1299 },
    { title: 'Ceramic Dinner Set 24-Piece', brand: 'HomeCraft', mrp: 3999, selling: 2799 },
    { title: 'Vacuum Insulated Flask', brand: 'ThermoKeep', mrp: 1499, selling: 999 },
    { title: 'Stand Mixer 5L', brand: 'ChefMate', mrp: 12999, selling: 9999 },
    { title: 'Cotton Bedsheet King Size', brand: 'SleepWell', mrp: 2499, selling: 1699 },
    { title: 'LED Desk Lamp', brand: 'BrightSpace', mrp: 1999, selling: 1399 },
    { title: 'Storage Organizer Boxes Set', brand: 'NeatHome', mrp: 1499, selling: 999 },
    { title: 'Coffee Maker Drip', brand: 'BrewMaster', mrp: 4999, selling: 3699 },
    { title: 'Wall Clock Modern', brand: 'BrightSpace', mrp: 1299, selling: 899 },
    { title: 'Induction Cooktop', brand: 'HeatQuick', mrp: 3999, selling: 2999 },
    { title: 'Microfiber Cleaning Mop', brand: 'CleanEase', mrp: 999, selling: 699 },
    { title: 'Air Fryer 4L', brand: 'ChefMate', mrp: 7999, selling: 5999 },
    { title: 'Decorative Floor Rug', brand: 'HomeCraft', mrp: 3499, selling: 2499 },
    { title: 'Stainless Steel Lunch Box', brand: 'ThermoKeep', mrp: 899, selling: 649 },
    { title: 'Glass Food Storage Set', brand: 'NeatHome', mrp: 1999, selling: 1399 },
    { title: 'Electric Toaster 2-Slice', brand: 'BrewMaster', mrp: 2499, selling: 1799 },
    { title: 'Curtain Set Blackout', brand: 'HomeCraft', mrp: 2999, selling: 2199 },
    { title: 'Kitchen Knife Set 6-Piece', brand: 'ChefMate', mrp: 3499, selling: 2499 },
    { title: 'Scented Candle Gift Set', brand: 'CalmAura', mrp: 1499, selling: 999 },
  ],
  'Beauty & Personal Care': [
    { title: 'Vitamin C Face Serum', brand: 'GlowLab', mrp: 1499, selling: 999 },
    { title: 'Hydrating Moisturizer SPF 30', brand: 'GlowLab', mrp: 999, selling: 749 },
    { title: 'Matte Lipstick Set', brand: 'ColorPop', mrp: 1999, selling: 1299 },
    { title: 'Men\'s Beard Grooming Kit', brand: 'SharpMan', mrp: 2499, selling: 1799 },
    { title: 'Paraben-Free Shampoo 400ml', brand: 'SilkStrands', mrp: 699, selling: 499 },
    { title: 'Electric Hair Trimmer', brand: 'SharpMan', mrp: 2999, selling: 2199 },
    { title: 'Sheet Mask Pack of 10', brand: 'GlowLab', mrp: 999, selling: 699 },
    { title: 'Perfume Eau de Parfum 50ml', brand: 'ScentAura', mrp: 3999, selling: 2999 },
    { title: 'Sunscreen Gel SPF 50', brand: 'GlowLab', mrp: 799, selling: 599 },
    { title: 'Makeup Brush Set 12-Piece', brand: 'ColorPop', mrp: 2499, selling: 1699 },
    { title: 'Body Lotion 400ml', brand: 'SilkStrands', mrp: 599, selling: 449 },
    { title: 'Charcoal Face Wash', brand: 'PureSkin', mrp: 499, selling: 349 },
    { title: 'Nail Polish Collection', brand: 'ColorPop', mrp: 1499, selling: 999 },
    { title: 'Hair Straightener Ceramic', brand: 'StylePro', mrp: 3499, selling: 2499 },
    { title: 'Under Eye Cream', brand: 'PureSkin', mrp: 1299, selling: 899 },
    { title: 'Deodorant Roll-On Pack', brand: 'FreshDay', mrp: 499, selling: 349 },
    { title: 'Bamboo Toothbrush Set', brand: 'EcoCare', mrp: 399, selling: 299 },
    { title: 'Aloe Vera Gel 200ml', brand: 'PureSkin', mrp: 349, selling: 249 },
    { title: 'Compact Powder', brand: 'ColorPop', mrp: 899, selling: 649 },
    { title: 'Herbal Hair Oil', brand: 'SilkStrands', mrp: 449, selling: 329 },
  ],
  'Sports & Fitness': [
    { title: 'Adjustable Dumbbell Set', brand: 'IronFlex', mrp: 7999, selling: 5999 },
    { title: 'Yoga Mat 6mm Anti-Slip', brand: 'ZenFit', mrp: 1499, selling: 999 },
    { title: 'Resistance Bands Set', brand: 'IronFlex', mrp: 999, selling: 699 },
    { title: 'Cricket Bat English Willow', brand: 'PlayPro', mrp: 4999, selling: 3799 },
    { title: 'Football Size 5', brand: 'PlayPro', mrp: 1499, selling: 999 },
    { title: 'Treadmill Foldable', brand: 'CardioMax', mrp: 34999, selling: 28999 },
    { title: 'Cycling Helmet', brand: 'RideSafe', mrp: 2499, selling: 1799 },
    { title: 'Protein Shaker Bottle', brand: 'FuelUp', mrp: 499, selling: 349 },
    { title: 'Badminton Racket Pair', brand: 'PlayPro', mrp: 2999, selling: 2199 },
    { title: 'Gym Gloves', brand: 'IronFlex', mrp: 799, selling: 549 },
    { title: 'Skipping Rope Steel Wire', brand: 'CardioMax', mrp: 599, selling: 399 },
    { title: 'Camping Tent 2-Person', brand: 'TrailBlaze', mrp: 5999, selling: 4499 },
    { title: 'Hiking Backpack 40L', brand: 'TrailBlaze', mrp: 3999, selling: 2999 },
    { title: 'Swimming Goggles', brand: 'AquaFit', mrp: 999, selling: 699 },
    { title: 'Foam Roller', brand: 'ZenFit', mrp: 1299, selling: 899 },
    { title: 'Basketball Official Size', brand: 'PlayPro', mrp: 1999, selling: 1399 },
    { title: 'Fitness Tracker Band', brand: 'FitPulse', mrp: 3999, selling: 2799 },
    { title: 'Pull-Up Bar Door Mount', brand: 'IronFlex', mrp: 2499, selling: 1799 },
    { title: 'Sports Water Bottle 1L', brand: 'FuelUp', mrp: 699, selling: 499 },
    { title: 'Table Tennis Bat Set', brand: 'PlayPro', mrp: 1999, selling: 1499 },
  ],
  Books: [
    { title: 'Atomic Habits', brand: 'Penguin', mrp: 599, selling: 449 },
    { title: 'The Psychology of Money', brand: 'Jaico', mrp: 499, selling: 379 },
    { title: 'Rich Dad Poor Dad', brand: 'Plata', mrp: 499, selling: 349 },
    { title: 'Ikigai', brand: 'Penguin', mrp: 399, selling: 299 },
    { title: 'Deep Work', brand: 'Hachette', mrp: 599, selling: 449 },
    { title: 'Sapiens', brand: 'Penguin', mrp: 699, selling: 499 },
    { title: 'The Alchemist', brand: 'Harper', mrp: 399, selling: 299 },
    { title: 'Think and Grow Rich', brand: 'Fingerprint', mrp: 299, selling: 219 },
    { title: 'Harry Potter Box Set', brand: 'Bloomsbury', mrp: 4999, selling: 3999 },
    { title: 'NCERT Science Class 10', brand: 'NCERT', mrp: 350, selling: 280 },
    { title: 'Word Power Made Easy', brand: 'Penguin', mrp: 299, selling: 229 },
    { title: 'The Lean Startup', brand: 'Penguin', mrp: 599, selling: 449 },
    { title: 'Wings of Fire', brand: 'Universities', mrp: 399, selling: 299 },
    { title: 'Mystery Thriller Bestseller', brand: 'Harper', mrp: 499, selling: 349 },
    { title: 'Indian History Compendium', brand: 'Orient', mrp: 799, selling: 599 },
    { title: 'Coding Interview Handbook', brand: 'TechPress', mrp: 899, selling: 699 },
    { title: 'Children Storybook Collection', brand: 'Scholastic', mrp: 699, selling: 499 },
    { title: 'Cookbook: 100 Easy Recipes', brand: 'Penguin', mrp: 799, selling: 599 },
    { title: 'Mindfulness Journal', brand: 'BlueStone', mrp: 499, selling: 379 },
    { title: 'Graphic Novel Edition', brand: 'Marvel', mrp: 1299, selling: 999 },
  ],
  Grocery: [
    { title: 'Basmati Rice 5kg', brand: 'GoldenGrain', mrp: 899, selling: 749 },
    { title: 'Extra Virgin Olive Oil 1L', brand: 'Mediterra', mrp: 1299, selling: 999 },
    { title: 'Organic Green Tea 100 Bags', brand: 'LeafPure', mrp: 499, selling: 379 },
    { title: 'Mixed Dry Fruits 500g', brand: 'NutHarvest', mrp: 799, selling: 649 },
    { title: 'Instant Coffee 200g', brand: 'BrewBlend', mrp: 599, selling: 449 },
    { title: 'Whole Wheat Atta 5kg', brand: 'GoldenGrain', mrp: 399, selling: 329 },
    { title: 'Dark Chocolate Bar Pack', brand: 'CocoaDelight', mrp: 499, selling: 379 },
    { title: 'Honey Pure 500g', brand: 'BeeNatural', mrp: 449, selling: 349 },
    { title: 'Protein Granola 400g', brand: 'FuelUp', mrp: 399, selling: 299 },
    { title: 'Tomato Ketchup 1kg', brand: 'KitchenKing', mrp: 199, selling: 149 },
    { title: 'Masala Chai Tea 500g', brand: 'LeafPure', mrp: 349, selling: 279 },
    { title: 'Almond Milk 1L Pack of 2', brand: 'PlantSip', mrp: 499, selling: 399 },
    { title: 'Pasta Penne 500g', brand: 'Italia', mrp: 199, selling: 149 },
    { title: 'Peanut Butter Creamy 340g', brand: 'NutHarvest', mrp: 299, selling: 229 },
    { title: 'Sparkling Water 6-Pack', brand: 'AquaFizz', mrp: 399, selling: 299 },
    { title: 'Breakfast Cereal 750g', brand: 'MorningCrisp', mrp: 449, selling: 349 },
    { title: 'Olive Pickles 500g', brand: 'KitchenKing', mrp: 249, selling: 189 },
    { title: 'Organic Turmeric Powder 200g', brand: 'SpiceRoot', mrp: 149, selling: 119 },
    { title: 'Energy Drink 4-Pack', brand: 'PowerRush', mrp: 399, selling: 319 },
    { title: 'Frozen Mixed Berries 500g', brand: 'FrostFresh', mrp: 599, selling: 479 },
  ],
  'Toys & Games': [
    { title: 'Building Blocks 500-Piece', brand: 'BlockWorld', mrp: 2499, selling: 1799 },
    { title: 'Remote Control Car', brand: 'SpeedToy', mrp: 1999, selling: 1399 },
    { title: 'Strategy Board Game', brand: 'GameNight', mrp: 1499, selling: 1099 },
    { title: 'Plush Teddy Bear', brand: 'CuddleCo', mrp: 999, selling: 699 },
    { title: '1000-Piece Jigsaw Puzzle', brand: 'GameNight', mrp: 799, selling: 599 },
    { title: 'Educational STEM Kit', brand: 'BrainBuild', mrp: 2999, selling: 2199 },
    { title: 'Action Figure Collectible', brand: 'HeroPlay', mrp: 1299, selling: 899 },
    { title: 'Art & Craft Supply Box', brand: 'CreateFun', mrp: 1499, selling: 1099 },
    { title: 'Monopoly Classic Edition', brand: 'GameNight', mrp: 1999, selling: 1499 },
    { title: 'Rubik\'s Cube Speed Edition', brand: 'BrainBuild', mrp: 599, selling: 449 },
    { title: 'Doll House Playset', brand: 'CuddleCo', mrp: 3499, selling: 2599 },
    { title: 'Outdoor Frisbee Set', brand: 'PlayPro', mrp: 699, selling: 499 },
    { title: 'Chess Set Wooden', brand: 'GameNight', mrp: 1299, selling: 999 },
    { title: 'RC Drone Beginner', brand: 'SkyFly', mrp: 4999, selling: 3799 },
    { title: 'Soft Play Mat for Toddlers', brand: 'TinySteps', mrp: 1999, selling: 1499 },
    { title: 'Card Games Party Pack', brand: 'GameNight', mrp: 899, selling: 649 },
    { title: 'Science Experiment Kit', brand: 'BrainBuild', mrp: 1799, selling: 1299 },
    { title: 'Mini Basketball Hoop', brand: 'PlayPro', mrp: 2499, selling: 1799 },
    { title: 'Magnetic Drawing Board', brand: 'CreateFun', mrp: 799, selling: 599 },
    { title: 'Train Set with Tracks', brand: 'BlockWorld', mrp: 3999, selling: 2999 },
  ],
}

const imageKeywords = {
  Electronics: 'technology,gadget',
  Fashion: 'fashion,clothing',
  'Home & Kitchen': 'kitchen,home',
  'Beauty & Personal Care': 'beauty,cosmetics',
  'Sports & Fitness': 'fitness,sports',
  Books: 'books,reading',
  Grocery: 'grocery,food',
  'Toys & Games': 'toys,games',
}

function buildDescription(title, brand, categoryTitle) {
  return `${title} by ${brand}. A popular pick in our ${categoryTitle} collection — quality you can trust with fast delivery and easy returns.`
}

function buildImageUrl(categoryTitle, index) {
  const keyword = imageKeywords[categoryTitle] || 'product'
  return `https://source.unsplash.com/600x600/?${encodeURIComponent(keyword)}&sig=${index}`
}

function randomStock() {
  return Math.floor(Math.random() * 91) + 10
}

function randomRating() {
  return Math.round((3.5 + Math.random() * 1.5) * 10) / 10
}

function randomRatingsCount() {
  return Math.floor(Math.random() * 490) + 10
}

async function seedCategories() {
  const categoryMap = {}

  for (const category of categories) {
    const doc = await Category.findOneAndUpdate(
      { title: category.title },
      { $setOnInsert: category },
      { upsert: true, returnDocument: 'after', runValidators: true }
    )
    categoryMap[category.title] = doc._id
    console.log(`Category ready: ${category.title}`)
  }

  return categoryMap
}

async function seedProducts(categoryMap, { clear = false } = {}) {
  if (clear) {
    const deleted = await Product.deleteMany({})
    console.log(`Cleared ${deleted.deletedCount} existing products`)
  }

  let created = 0
  let skipped = 0

  for (const [categoryTitle, items] of Object.entries(productCatalog)) {
    const categoryId = categoryMap[categoryTitle]
    if (!categoryId) {
      console.warn(`Skipping unknown category: ${categoryTitle}`)
      continue
    }

    const productsToInsert = items.slice(0, PRODUCTS_PER_CATEGORY)

    for (let i = 0; i < productsToInsert.length; i++) {
      const item = productsToInsert[i]
      const exists = await Product.findOne({ title: item.title, categoryId })

      if (exists) {
        skipped++
        continue
      }

      await Product.create({
        title: item.title,
        description: buildDescription(item.title, item.brand, categoryTitle),
        mrpPrice: item.mrp,
        sellingPrice: item.selling,
        images: [buildImageUrl(categoryTitle, i + 1)],
        categoryId,
        stockQuantity: randomStock(),
        rating: randomRating(),
        noOfRatings: randomRatingsCount(),
        brand: item.brand,
        isActive: true,
      })
      created++
    }

    console.log(`Products seeded for ${categoryTitle}`)
  }

  return { created, skipped }
}

async function main() {
  const clear = process.argv.includes('--clear')

  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not set. Add it to ecommerce-backend/.env')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Connected to MongoDB')

  const categoryMap = await seedCategories()
  const { created, skipped } = await seedProducts(categoryMap, { clear })

  const totalProducts = await Product.countDocuments()
  const totalCategories = await Category.countDocuments()

  console.log('\nSeed complete!')
  console.log(`  Categories: ${totalCategories}`)
  console.log(`  Products created: ${created}`)
  console.log(`  Products skipped (already exist): ${skipped}`)
  console.log(`  Total products in DB: ${totalProducts}`)

  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error('Seed failed:', err)
  await mongoose.disconnect()
  process.exit(1)
})
