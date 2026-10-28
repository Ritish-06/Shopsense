import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting deterministic database seeding for ShopSense...");

  // Clean existing records
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.businessInsight.deleteMany();
  await prisma.forecastResult.deleteMany();
  await prisma.forecastRun.deleteMany();
  await prisma.salesEvent.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.stockReservation.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.supplierProduct.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.productReview.deleteMany();
  await prisma.retailerProduct.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.userPreference.deleteMany();
  await prisma.retailerProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 1. Create Core Users
  console.log("👤 Creating platform users...");
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@shopsense.com",
      name: "Platform Administrator",
      passwordHash,
      role: "ADMIN",
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: "customer@shopsense.com",
      name: "Rahul Sharma",
      passwordHash,
      role: "CUSTOMER",
    },
  });

  const customerUser2 = await prisma.user.create({
    data: {
      email: "priya@shopsense.com",
      name: "Priya Patel",
      passwordHash,
      role: "CUSTOMER",
    },
  });

  // Default address for Rahul
  await prisma.address.create({
    data: {
      userId: customerUser.id,
      fullName: "Rahul Sharma",
      line1: "Flat 402, Green Glen Residency, Outer Ring Road",
      line2: "Bellandur",
      city: "Bengaluru",
      state: "Karnataka",
      postalCode: "560103",
      country: "IN",
      phone: "+91 98765 43210",
      isDefault: true,
    },
  });

  // Create Cart & Wishlist for customer
  await prisma.cart.create({
    data: { userId: customerUser.id },
  });
  await prisma.wishlist.create({
    data: { userId: customerUser.id },
  });

  // 2. Create Retailer Users & Profiles
  console.log("🏪 Creating retailer accounts...");
  const retailer1User = await prisma.user.create({
    data: {
      email: "apex@shopsense.com",
      name: "Apex Tech Direct",
      passwordHash,
      role: "RETAILER",
    },
  });

  const retailer1Profile = await prisma.retailerProfile.create({
    data: {
      userId: retailer1User.id,
      storeName: "Apex Tech Direct",
      storeSlug: "apex-tech-direct",
      description: "Premier authorized retailer for high-performance computing, audio gear, and flagship electronics.",
      logoUrl: "https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?w=200&h=200&fit=crop",
      contactEmail: "sales@apextech.in",
      contactPhone: "+91 80 4123 5678",
      address: "Indiranagar 100ft Road, Bengaluru, Karnataka",
      isVerified: true,
    },
  });

  const retailer2User = await prisma.user.create({
    data: {
      email: "nova@shopsense.com",
      name: "Nova Electronics",
      passwordHash,
      role: "RETAILER",
    },
  });

  const retailer2Profile = await prisma.retailerProfile.create({
    data: {
      userId: retailer2User.id,
      storeName: "Nova Electronics",
      storeSlug: "nova-electronics",
      description: "Curated smart home ecosystems, wearable technology, and mobile gear.",
      logoUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=200&h=200&fit=crop",
      contactEmail: "orders@novaelectronics.in",
      contactPhone: "+91 22 2654 9870",
      address: "Bandra West, Mumbai, Maharashtra",
      isVerified: true,
    },
  });

  const retailer3User = await prisma.user.create({
    data: {
      email: "horizon@shopsense.com",
      name: "Horizon Gadgets",
      passwordHash,
      role: "RETAILER",
    },
  });

  const retailer3Profile = await prisma.retailerProfile.create({
    data: {
      userId: retailer3User.id,
      storeName: "Horizon Gadgets",
      storeSlug: "horizon-gadgets",
      description: "Fast-moving tech essentials, photography accessories, and audio devices.",
      logoUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200&h=200&fit=crop",
      contactEmail: "support@horizongadgets.com",
      contactPhone: "+91 11 2345 6789",
      address: "Connaught Place, New Delhi",
      isVerified: true,
    },
  });

  // 3. Create Suppliers for Retailers
  console.log("🚚 Creating verified suppliers...");
  const apexSupplier = await prisma.supplier.create({
    data: {
      retailerId: retailer1Profile.id,
      name: "Synnex Tech Distribution India",
      contactPerson: "Arun Verma",
      email: "arun.v@synnex-dist.in",
      phone: "+91 99887 76655",
      leadTimeDays: 5,
    },
  });

  const novaSupplier = await prisma.supplier.create({
    data: {
      retailerId: retailer2Profile.id,
      name: "Ingram Micro Logistics",
      contactPerson: "Meera Nair",
      email: "meera.n@ingrammicro.com",
      phone: "+91 98112 23344",
      leadTimeDays: 7,
    },
  });

  // 4. Create Categories
  console.log("📁 Creating product categories...");
  const categoriesData = [
    {
      name: "Laptops & Computing",
      slug: "laptops-computing",
      description: "Ultrabooks, workstations, gaming laptops, and productivity monitors.",
      imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&fit=crop",
    },
    {
      name: "Smartphones & Tablets",
      slug: "smartphones-tablets",
      description: "Flagship phones, value champions, and high-performance tablets.",
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02544?w=800&fit=crop",
    },
    {
      name: "Audio & Headphones",
      slug: "audio-headphones",
      description: "Noise-cancelling headphones, wireless earbuds, and studio monitors.",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&fit=crop",
    },
    {
      name: "Smart Home & IoT",
      slug: "smart-home-iot",
      description: "Security hubs, smart lighting, automated vacuum cleaners, and voice displays.",
      imageUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&fit=crop",
    },
    {
      name: "Wearables & Fitness",
      slug: "wearables-fitness",
      description: "Smartwatches, GPS sports trackers, health monitors, and smart rings.",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&fit=crop",
    },
    {
      name: "Cameras & Content Gear",
      slug: "cameras-gear",
      description: "Mirrorless cameras, vlogging lenses, wireless microphones, and lighting.",
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&fit=crop",
    },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categoryMap[cat.slug] = created;
  }

  // 5. Seed 105 Realistic Demo Products
  console.log("📦 Generating 100+ comprehensive demo products with specs, variants, & images...");

  const baseProducts = [
    // Laptops & Computing (20 items)
    {
      title: "MacBook Pro 14 M3 Pro",
      slug: "macbook-pro-14-m3-pro",
      brand: "Apple",
      cat: "laptops-computing",
      price: 199900,
      cost: 165000,
      rating: 4.9,
      reviewCount: 42,
      specs: { Processor: "Apple M3 Pro (12-core)", RAM: "18GB Unified", Storage: "512GB SSD", Display: "14.2-inch Liquid Retina XDR 120Hz", Battery: "Up to 18 hours", Weight: "1.61 kg" },
      tags: ["apple", "macbook", "m3", "laptop", "video editing", "programming", "pro"],
      image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&fit=crop",
    },
    {
      title: "Dell XPS 15 9530 OLED",
      slug: "dell-xps-15-9530-oled",
      brand: "Dell",
      cat: "laptops-computing",
      price: 174990,
      cost: 142000,
      rating: 4.7,
      reviewCount: 31,
      specs: { Processor: "Intel Core i7-13700H", RAM: "32GB DDR5", Storage: "1TB PCIe Gen4 SSD", Display: "15.6-inch 3.5K OLED Touch", GPU: "NVIDIA RTX 4060 8GB", Weight: "1.92 kg" },
      tags: ["dell", "xps", "oled", "creative", "laptop", "windows", "programming"],
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&fit=crop",
    },
    {
      title: "Lenovo ThinkPad X1 Carbon Gen 11",
      slug: "lenovo-thinkpad-x1-carbon-gen-11",
      brand: "Lenovo",
      cat: "laptops-computing",
      price: 148500,
      cost: 122000,
      rating: 4.8,
      reviewCount: 29,
      specs: { Processor: "Intel Core i7-1365U vPro", RAM: "16GB LPDDR5", Storage: "512GB NVMe SSD", Display: "14-inch 2.8K OLED Antiglare", Weight: "1.12 kg", Battery: "Up to 14 hours" },
      tags: ["lenovo", "thinkpad", "business", "ultrabook", "lightweight", "coding"],
      image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&fit=crop",
    },
    {
      title: "ASUS ROG Zephyrus G14",
      slug: "asus-rog-zephyrus-g14",
      brand: "ASUS",
      cat: "laptops-computing",
      price: 139990,
      cost: 115000,
      rating: 4.6,
      reviewCount: 38,
      specs: { Processor: "AMD Ryzen 9 8945HS", RAM: "16GB LPDDR5X", Storage: "1TB NVMe SSD", GPU: "NVIDIA RTX 4070 8GB", Display: "14-inch 3K OLED 120Hz 0.2ms", Weight: "1.5 kg" },
      tags: ["asus", "rog", "gaming", "portable", "ryzen", "rtx", "creative"],
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&fit=crop",
    },
    {
      title: "MacBook Air 13 M3",
      slug: "macbook-air-13-m3",
      brand: "Apple",
      cat: "laptops-computing",
      price: 114900,
      cost: 95000,
      rating: 4.9,
      reviewCount: 54,
      specs: { Processor: "Apple M3 (8-core)", RAM: "16GB Unified", Storage: "512GB SSD", Display: "13.6-inch Liquid Retina", Battery: "Up to 18 hours", Weight: "1.24 kg" },
      tags: ["apple", "macbook air", "m3", "college", "programming", "battery"],
      image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&fit=crop",
    },
    {
      title: "HP Pavilion Aero 13",
      slug: "hp-pavilion-aero-13",
      brand: "HP",
      cat: "laptops-computing",
      price: 68990,
      cost: 56000,
      rating: 4.5,
      reviewCount: 22,
      specs: { Processor: "AMD Ryzen 7 7735U", RAM: "16GB LPDDR5", Storage: "512GB SSD", Display: "13.3-inch WQXGA 400nits 100% sRGB", Weight: "970 grams" },
      tags: ["hp", "aero", "lightweight", "budget ultrabook", "student", "fast"],
      image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&fit=crop",
    },
    {
      title: "Acer Swift Go 14 AI",
      slug: "acer-swift-go-14-ai",
      brand: "Acer",
      cat: "laptops-computing",
      price: 74990,
      cost: 61000,
      rating: 4.4,
      reviewCount: 19,
      specs: { Processor: "Intel Core Ultra 5 125H", RAM: "16GB LPDDR5X", Storage: "512GB Gen4 SSD", Display: "14-inch OLED 90Hz", NPU: "Intel AI Boost" },
      tags: ["acer", "swift", "intel ultra", "ai pc", "oled", "productivity"],
      image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&fit=crop",
    },
    {
      title: "LG Gram 16 Pro",
      slug: "lg-gram-16-pro",
      brand: "LG",
      cat: "laptops-computing",
      price: 142000,
      cost: 118000,
      rating: 4.6,
      reviewCount: 17,
      specs: { Processor: "Intel Core Ultra 7", RAM: "32GB LPDDR5X", Storage: "1TB SSD", Display: "16-inch WQXGA Anti-glare", Weight: "1.19 kg", Battery: "77Wh" },
      tags: ["lg", "gram", "lightweight", "large display", "battery king"],
      image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&fit=crop",
    },
    {
      title: "Dell UltraSharp 27 4K Hub Monitor U2723QE",
      slug: "dell-ultrasharp-27-4k-u2723qe",
      brand: "Dell",
      cat: "laptops-computing",
      price: 54900,
      cost: 44000,
      rating: 4.8,
      reviewCount: 26,
      specs: { Display: "27-inch 4K IPS Black", Contrast: "2000:1", Connectivity: "USB-C 90W PD, RJ45 LAN, DisplayPort, HDMI", Color: "98% DCI-P3" },
      tags: ["dell", "monitor", "4k", "ips black", "docking", "usb-c", "productivity"],
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&fit=crop",
    },
    {
      title: "BenQ PD3205U 32-inch 4K Designer Monitor",
      slug: "benq-pd3205u-32-4k-designer-monitor",
      brand: "BenQ",
      cat: "laptops-computing",
      price: 64990,
      cost: 52000,
      rating: 4.7,
      reviewCount: 14,
      specs: { Display: "31.5-inch 4K UHD", Features: "AQCOLOR technology, KVM Switch, Hotkey Puck G2, Type-C 90W", HDR: "HDR10" },
      tags: ["benq", "designer monitor", "color accurate", "mac ready", "4k"],
      image: "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800&fit=crop",
    },
    {
      title: "Logitech MX Master 3S Wireless Mouse",
      slug: "logitech-mx-master-3s",
      brand: "Logitech",
      cat: "laptops-computing",
      price: 9495,
      cost: 7200,
      rating: 4.9,
      reviewCount: 95,
      specs: { Sensor: "8000 DPI Darkfield", Clicks: "90% Quiet Clicks", Scroll: "MagSpeed Electromagnetic", Connectivity: "Bluetooth + Bolt USB" },
      tags: ["logitech", "mx master", "ergonomic", "productivity", "mouse", "bluetooth"],
      image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&fit=crop",
    },
    {
      title: "Keychron Q1 Pro Wireless Custom Mechanical Keyboard",
      slug: "keychron-q1-pro-wireless",
      brand: "Keychron",
      cat: "laptops-computing",
      price: 18490,
      cost: 14500,
      rating: 4.8,
      reviewCount: 33,
      specs: { Layout: "75% ANSI QMK/VIA", Body: "Full CNC Aluminum", Connectivity: "Bluetooth 5.1 + Type-C", Switches: "Keychron K Pro Red" },
      tags: ["keychron", "mechanical keyboard", "aluminum", "wireless", "coding", "mac"],
      image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&fit=crop",
    },
    {
      title: "CalDigit TS4 Thunderbolt 4 Dock",
      slug: "caldigit-ts4-thunderbolt-4-dock",
      brand: "CalDigit",
      cat: "laptops-computing",
      price: 36990,
      cost: 29500,
      rating: 4.9,
      reviewCount: 18,
      specs: { Ports: "18 Ports total", Power: "98W Charging", Speed: "40Gb/s Thunderbolt 4", Ethernet: "2.5 Gigabit" },
      tags: ["dock", "thunderbolt 4", "ports", "macbook", "workstation"],
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&fit=crop",
    },
    {
      title: "Samsung T9 Portable SSD 2TB",
      slug: "samsung-t9-portable-ssd-2tb",
      brand: "Samsung",
      cat: "laptops-computing",
      price: 21990,
      cost: 17200,
      rating: 4.8,
      reviewCount: 44,
      specs: { Interface: "USB 3.2 Gen 2x2", Speed: "Up to 2,000 MB/s", Durability: "Drop resistant up to 3 meters", Encryption: "AES 256-bit" },
      tags: ["samsung", "ssd", "portable", "fast storage", "external drive"],
      image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&fit=crop",
    },
    {
      title: "Anker Prime 20,000mAh Power Bank 200W",
      slug: "anker-prime-20000mah-200w",
      brand: "Anker",
      cat: "laptops-computing",
      price: 11990,
      cost: 9200,
      rating: 4.7,
      reviewCount: 36,
      specs: { Capacity: "20,000 mAh", TotalOutput: "200W Maximum", SinglePort: "100W USB-C", Display: "Smart Digital Display" },
      tags: ["anker", "power bank", "laptop charger", "fast charging", "travel"],
      image: "https://images.unsplash.com/photo-1609592424368-e6b7d2bfca8c?w=800&fit=crop",
    },
    {
      title: "Lenovo Legion Pro 7i Gen 9",
      slug: "lenovo-legion-pro-7i-gen-9",
      brand: "Lenovo",
      cat: "laptops-computing",
      price: 249990,
      cost: 205000,
      rating: 4.8,
      reviewCount: 15,
      specs: { Processor: "Intel Core i9-14900HX", RAM: "32GB DDR5 5600MHz", Storage: "2TB Gen4 SSD", GPU: "NVIDIA RTX 4080 12GB 175W", Display: "16-inch WQXGA 240Hz 500nits" },
      tags: ["lenovo", "legion", "gaming monster", "i9", "rtx 4080", "high fps"],
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&fit=crop",
    },
    {
      title: "ASUS Zenbook Duo Dual-Screen OLED",
      slug: "asus-zenbook-duo-dual-oled",
      brand: "ASUS",
      cat: "laptops-computing",
      price: 169990,
      cost: 140000,
      rating: 4.7,
      reviewCount: 12,
      specs: { Screens: "Dual 14-inch 3K 120Hz OLED Displays", Processor: "Intel Core Ultra 7 155H", Keyboard: "Detachable Bluetooth Keyboard", Weight: "1.65 kg" },
      tags: ["asus", "zenbook", "dual screen", "multitasking", "oled", "creative"],
      image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&fit=crop",
    },
    {
      title: "Apple Studio Display 27 5K",
      slug: "apple-studio-display-27-5k",
      brand: "Apple",
      cat: "laptops-computing",
      price: 159900,
      cost: 138000,
      rating: 4.7,
      reviewCount: 28,
      specs: { Display: "27-inch 5K Retina (5120x2880)", Brightness: "600 nits", Camera: "12MP Ultra Wide with Center Stage", Audio: "Six-speaker sound system with Spatial Audio" },
      tags: ["apple", "studio display", "5k", "retina", "macbook companion"],
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&fit=crop",
    },
    {
      title: "Logitech MX Keys S Wireless Keyboard",
      slug: "logitech-mx-keys-s",
      brand: "Logitech",
      cat: "laptops-computing",
      price: 10995,
      cost: 8400,
      rating: 4.8,
      reviewCount: 52,
      specs: { Typing: "Spherically dished keys", Illumination: "Smart backlighting with hand proximity", Battery: "Up to 5 months without backlight" },
      tags: ["logitech", "mx keys", "quiet", "ergonomic", "mac and windows"],
      image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&fit=crop",
    },
    {
      title: "Dell Latitude 7440 Ultralight",
      slug: "dell-latitude-7440-ultralight",
      brand: "Dell",
      cat: "laptops-computing",
      price: 128990,
      cost: 106000,
      rating: 4.5,
      reviewCount: 16,
      specs: { Processor: "Intel Core i7-1365U vPro", RAM: "16GB LPDDR5", Weight: "1.06 kg Magnesium Chassis", Security: "SafeID, SafeBIOS, Fingerprint" },
      tags: ["dell", "latitude", "enterprise", "lightweight", "security"],
      image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&fit=crop",
    },

    // Smartphones & Tablets (20 items)
    {
      title: "iPhone 15 Pro Max 256GB Natural Titanium",
      slug: "iphone-15-pro-max-256gb",
      brand: "Apple",
      cat: "smartphones-tablets",
      price: 148900,
      cost: 126000,
      rating: 4.9,
      reviewCount: 78,
      specs: { Chip: "A17 Pro (3nm)", Material: "Titanium with textured matte glass", Camera: "48MP Main + 5x Telephoto optical zoom", Connector: "USB-C with USB 3 speeds", Screen: "6.7-inch Super Retina XDR 120Hz" },
      tags: ["apple", "iphone", "iphone 15 pro max", "titanium", "flagship camera", "ios"],
      image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&fit=crop",
    },
    {
      title: "Samsung Galaxy S24 Ultra 512GB",
      slug: "samsung-galaxy-s24-ultra-512gb",
      brand: "Samsung",
      cat: "smartphones-tablets",
      price: 139999,
      cost: 118000,
      rating: 4.8,
      reviewCount: 64,
      specs: { Processor: "Snapdragon 8 Gen 3 for Galaxy", AI: "Galaxy AI Live Translate & Circle to Search", S_Pen: "Integrated S-Pen stylus", Display: "6.8-inch Dynamic AMOLED 2X Flat Anti-reflective", Camera: "200MP Quad Tele System" },
      tags: ["samsung", "galaxy s24 ultra", "galaxy ai", "s-pen", "android flagship", "200mp"],
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&fit=crop",
    },
    {
      title: "Google Pixel 8 Pro 128GB Bay Blue",
      slug: "google-pixel-8-pro-bay-blue",
      brand: "Google",
      cat: "smartphones-tablets",
      price: 99999,
      cost: 82000,
      rating: 4.7,
      reviewCount: 45,
      specs: { Tensor: "Google Tensor G3", Screen: "6.7-inch Super Actua OLED 1-120Hz", Magic_Editor: "Audio Magic Eraser & Best Take", Support: "7 years of OS & security updates" },
      tags: ["google", "pixel 8 pro", "pure android", "best camera", "computational photography"],
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&fit=crop",
    },
    {
      title: "OnePlus 12 16GB 512GB Silky Black",
      slug: "oneplus-12-16gb-512gb",
      brand: "OnePlus",
      cat: "smartphones-tablets",
      price: 69999,
      cost: 58000,
      rating: 4.8,
      reviewCount: 59,
      specs: { Chip: "Snapdragon 8 Gen 3", Battery: "5,400 mAh", Charging: "100W SuperVOOC Wired + 50W AirVOOC", Screen: "2K 120Hz ProXDR 4500 nits Peak", Camera: "4th Gen Hasselblad Camera for Mobile" },
      tags: ["oneplus", "oneplus 12", "fast charging", "value flagship", "hasselblad"],
      image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&fit=crop",
    },
    {
      title: "iPad Pro 11-inch M4 OLED 256GB",
      slug: "ipad-pro-11-inch-m4-oled",
      brand: "Apple",
      cat: "smartphones-tablets",
      price: 99900,
      cost: 84000,
      rating: 4.9,
      reviewCount: 32,
      specs: { Chip: "Apple M4", Display: "Ultra Retina XDR Tandem OLED", Thickness: "5.3mm Ultra-thin", Accessory: "Apple Pencil Pro Support" },
      tags: ["apple", "ipad pro", "m4", "tandem oled", "digital art", "tablet"],
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&fit=crop",
    },
    {
      title: "Samsung Galaxy Tab S9 Ultra 256GB",
      slug: "samsung-galaxy-tab-s9-ultra",
      brand: "Samsung",
      cat: "smartphones-tablets",
      price: 108999,
      cost: 89000,
      rating: 4.7,
      reviewCount: 23,
      specs: { Screen: "14.6-inch Dynamic AMOLED 2X 120Hz", WaterResistance: "IP68 Dust & Water Resistant", Audio: "Quad AKG Speakers", DeX: "Samsung DeX desktop mode" },
      tags: ["samsung", "tab s9 ultra", "giant tablet", "dex", "amoled", "stylus"],
      image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&fit=crop",
    },
    {
      title: "Nothing Phone (2) 12GB 256GB White",
      slug: "nothing-phone-2-white",
      brand: "Nothing",
      cat: "smartphones-tablets",
      price: 37999,
      cost: 31000,
      rating: 4.5,
      reviewCount: 48,
      specs: { Interface: "Glyph Interface LED Matrix", OS: "Nothing OS 2.5 Clean", Chip: "Snapdragon 8+ Gen 1", Screen: "6.7-inch Flexible OLED LTPO" },
      tags: ["nothing", "glyph", "transparent design", "clean os", "budget flagship"],
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02544?w=800&fit=crop",
    },
    {
      title: "Xiaomi 14 Ultra Leica Optics",
      slug: "xiaomi-14-ultra-leica",
      brand: "Xiaomi",
      cat: "smartphones-tablets",
      price: 99999,
      cost: 83000,
      rating: 4.8,
      reviewCount: 21,
      specs: { Lens: "1-inch Sony LYT-900 sensor + Leica Quad Camera", VariableAperture: "Stepless f/1.63 - f/4.0", Build: "Vegan Leather + High Strength Aluminum" },
      tags: ["xiaomi", "leica", "1 inch sensor", "pro camera phone", "flagship"],
      image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&fit=crop",
    },
    {
      title: "iPad Air 11-inch M2 128GB",
      slug: "ipad-air-11-inch-m2",
      brand: "Apple",
      cat: "smartphones-tablets",
      price: 59900,
      cost: 51000,
      rating: 4.8,
      reviewCount: 41,
      specs: { Chip: "Apple M2 (8-core CPU, 10-core GPU)", Display: "11-inch Liquid Retina with True Tone", Audio: "Landscape Stereo Speakers" },
      tags: ["apple", "ipad air", "m2", "students", "drawing", "portable"],
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&fit=crop",
    },
    {
      title: "Motorola Edge 50 Ultra Peach Fuzz",
      slug: "motorola-edge-50-ultra",
      brand: "Motorola",
      cat: "smartphones-tablets",
      price: 59999,
      cost: 49000,
      rating: 4.6,
      reviewCount: 27,
      specs: { Back: "Real Wood / Vegan Leather Finish", Chip: "Snapdragon 8s Gen 3", Charging: "125W TurboPower + 50W Wireless", Screen: "1.5K 144Hz pOLED" },
      tags: ["motorola", "edge 50 ultra", "pantone", "wood finish", "fast charging"],
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02544?w=800&fit=crop",
    },
    {
      title: "Samsung Galaxy Z Fold 5 256GB Phantom Black",
      slug: "samsung-galaxy-z-fold-5",
      brand: "Samsung",
      cat: "smartphones-tablets",
      price: 154999,
      cost: 130000,
      rating: 4.7,
      reviewCount: 34,
      specs: { MainScreen: "7.6-inch Dynamic AMOLED 2X 120Hz Foldable", FlexHinge: "Zero gap flex hinge", MultiTasking: "Three app split view" },
      tags: ["samsung", "foldable", "z fold 5", "multitasking", "productivity beast"],
      image: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&fit=crop",
    },
    {
      title: "Apple Pencil Pro",
      slug: "apple-pencil-pro",
      brand: "Apple",
      cat: "smartphones-tablets",
      price: 11900,
      cost: 9500,
      rating: 4.9,
      reviewCount: 62,
      specs: { Sensor: "Squeeze gesture sensor", Haptics: "Custom haptic feedback engine", Gyroscope: "Barrel roll rotation" },
      tags: ["apple", "pencil pro", "ipad accessory", "stylus", "drawing"],
      image: "https://images.unsplash.com/photo-1585336261026-7d9a184518db?w=800&fit=crop",
    },
    {
      title: "Samsung Galaxy Z Flip 5 256GB Mint",
      slug: "samsung-galaxy-z-flip-5-mint",
      brand: "Samsung",
      cat: "smartphones-tablets",
      price: 99999,
      cost: 82000,
      rating: 4.6,
      reviewCount: 39,
      specs: { FlexWindow: "3.4-inch Super AMOLED Cover Screen", FormFactor: "Pocket-sized clamshell fold", Camera: "FlexCam hands-free selfies" },
      tags: ["samsung", "flip 5", "clamshell", "foldable phone", "compact"],
      image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&fit=crop",
    },
    {
      title: "Realme GT 6 5G 16GB 512GB",
      slug: "realme-gt-6-5g",
      brand: "Realme",
      cat: "smartphones-tablets",
      price: 44999,
      cost: 37000,
      rating: 4.6,
      reviewCount: 35,
      specs: { Display: "6000 nits Ultra Bright 8T LTPO", Chipset: "Snapdragon 8s Gen 3", Battery: "5500mAh + 120W SuperVOOC" },
      tags: ["realme", "gt 6", "brightest display", "gaming", "fast battery"],
      image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&fit=crop",
    },
    {
      title: "OnePlus Pad 2 12-inch 3K 144Hz",
      slug: "oneplus-pad-2",
      brand: "OnePlus",
      cat: "smartphones-tablets",
      price: 39999,
      cost: 32000,
      rating: 4.7,
      reviewCount: 22,
      specs: { Chip: "Snapdragon 8 Gen 3", Display: "12.1-inch 3K 144Hz 7:5 ReadFit", Speakers: "6 Omnidirectional speakers" },
      tags: ["oneplus", "oneplus pad 2", "tablet", "entertainment", "value android tablet"],
      image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&fit=crop",
    },
    {
      title: "Google Pixel 8a 128GB Aloe",
      slug: "google-pixel-8a-aloe",
      brand: "Google",
      cat: "smartphones-tablets",
      price: 52999,
      cost: 44000,
      rating: 4.6,
      reviewCount: 29,
      specs: { Chip: "Google Tensor G3", Screen: "6.1-inch Actua 120Hz OLED", IP_Rating: "IP67 Water and Dust Resistant", Camera: "64MP Quad PD" },
      tags: ["google", "pixel 8a", "compact phone", "best budget camera", "clean android"],
      image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&fit=crop",
    },
    {
      title: "Apple Magic Keyboard for iPad Pro 11-inch M4",
      slug: "apple-magic-keyboard-ipad-pro-11-m4",
      brand: "Apple",
      cat: "smartphones-tablets",
      price: 29900,
      cost: 24500,
      rating: 4.8,
      reviewCount: 24,
      specs: { Material: "Aluminum palm rest with haptic trackpad", FunctionRow: "14-key function row with screen brightness and volume", Charging: "USB-C pass-through" },
      tags: ["apple", "magic keyboard", "ipad pro accessory", "aluminum trackpad"],
      image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&fit=crop",
    },
    {
      title: "Samsung Galaxy S23 FE 5G 128GB",
      slug: "samsung-galaxy-s23-fe",
      brand: "Samsung",
      cat: "smartphones-tablets",
      price: 49999,
      cost: 40000,
      rating: 4.4,
      reviewCount: 46,
      specs: { Screen: "6.4-inch Dynamic AMOLED 2X", Camera: "50MP Nightography", Processor: "Exynos 2200 4nm" },
      tags: ["samsung", "s23 fe", "fan edition", "budget premium"],
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&fit=crop",
    },
    {
      title: "POCO F6 Pro 5G 12GB 512GB",
      slug: "poco-f6-pro-5g",
      brand: "POCO",
      cat: "smartphones-tablets",
      price: 33999,
      cost: 28000,
      rating: 4.5,
      reviewCount: 38,
      specs: { Chip: "Snapdragon 8 Gen 2", Display: "WQHD+ 120Hz Flow AMOLED 4000 nits", Charging: "120W HyperCharge" },
      tags: ["poco", "poco f6 pro", "gaming phone", "budget flagship", "fast charging"],
      image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&fit=crop",
    },
    {
      title: "Belkin BoostCharge Pro 3-in-1 MagSafe Wireless Charger",
      slug: "belkin-boostcharge-pro-3-in-1-magsafe",
      brand: "Belkin",
      cat: "smartphones-tablets",
      price: 13999,
      cost: 10500,
      rating: 4.8,
      reviewCount: 31,
      specs: { MagSafe: "Official 15W Fast Wireless Charging for iPhone", AppleWatch: "Fast Charger for Apple Watch Series 7+", AirPods: "5W QI Pad" },
      tags: ["belkin", "magsafe", "wireless charger", "stand", "bedside stand"],
      image: "https://images.unsplash.com/photo-1609592424368-e6b7d2bfca8c?w=800&fit=crop",
    },

    // Audio & Headphones (20 items)
    {
      title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
      slug: "sony-wh-1000xm5-headphones",
      brand: "Sony",
      cat: "audio-headphones",
      price: 29990,
      cost: 23500,
      rating: 4.9,
      reviewCount: 88,
      specs: { ANC: "Integrated Processor V1 with Dual Noise Sensor", Battery: "Up to 30 hours with ANC", Codec: "LDAC High-Resolution Wireless", Mics: "8 Beamforming Microphones" },
      tags: ["sony", "wh-1000xm5", "anc", "noise cancelling", "best headphones", "travel"],
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&fit=crop",
    },
    {
      title: "Apple AirPods Pro 2nd Gen with USB-C",
      slug: "apple-airpods-pro-2-usb-c",
      brand: "Apple",
      cat: "audio-headphones",
      price: 24900,
      cost: 20000,
      rating: 4.9,
      reviewCount: 110,
      specs: { Chip: "Apple H2 Headphone Chip", ANC: "2x More Active Noise Cancellation", Audio: "Adaptive Audio & Conversation Awareness", Case: "MagSafe Case with Speaker & Precision Finding" },
      tags: ["apple", "airpods pro 2", "earbuds", "noise cancelling", "spatial audio", "usb-c"],
      image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&fit=crop",
    },
    {
      title: "Bose QuietComfort Ultra Headphones",
      slug: "bose-quietcomfort-ultra-headphones",
      brand: "Bose",
      cat: "audio-headphones",
      price: 35900,
      cost: 28500,
      rating: 4.8,
      reviewCount: 47,
      specs: { Audio: "Bose Immersive Audio Spatialized Sound", Modes: "Quiet, Aware, and Immersion modes", Comfort: "Plush earcups with minimal clamping pressure" },
      tags: ["bose", "qc ultra", "comfort king", "airplane travel", "audiophile"],
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&fit=crop",
    },
    {
      title: "Sennheiser Momentum 4 Wireless",
      slug: "sennheiser-momentum-4-wireless",
      brand: "Sennheiser",
      cat: "audio-headphones",
      price: 26990,
      cost: 21000,
      rating: 4.7,
      reviewCount: 39,
      specs: { Battery: "Unrivaled 60-Hour Battery Life", Drivers: "Audiophile-inspired 42mm Transducers", EQ: "Built-in 5-band Equalizer and Sound Personalization" },
      tags: ["sennheiser", "momentum 4", "60 hour battery", "audiophile grade sound", "bluetooth"],
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&fit=crop",
    },
    {
      title: "Sony WF-1000XM5 True Wireless Earbuds",
      slug: "sony-wf-1000xm5-earbuds",
      brand: "Sony",
      cat: "audio-headphones",
      price: 23990,
      cost: 18800,
      rating: 4.7,
      reviewCount: 52,
      specs: { NoiseCanceling: "HD Noise Cancelling Processor QN2e", Driver: "Dynamic Driver X for wide frequency reproduction", CallQuality: "AI-based noise reduction algorithm with bone conduction sensor" },
      tags: ["sony", "wf-1000xm5", "wireless earbuds", "high res audio", "ldac"],
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&fit=crop",
    },
    {
      title: "Marshall Stanmore III Bluetooth Speaker",
      slug: "marshall-stanmore-iii-speaker",
      brand: "Marshall",
      cat: "audio-headphones",
      price: 37999,
      cost: 29500,
      rating: 4.8,
      reviewCount: 34,
      specs: { Amplifiers: "50W Class D for Woofer + two 15W Class D for Tweeters", Sound: "Wider stereo soundstage with Dynamic Loudness", Bluetooth: "Bluetooth 5.2 with LE Audio readiness" },
      tags: ["marshall", "stanmore", "home speaker", "vintage retro", "heavy bass"],
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&fit=crop",
    },
    {
      title: "Nothing Ear (2024) High-Res Wireless Earbuds",
      slug: "nothing-ear-2024",
      brand: "Nothing",
      cat: "audio-headphones",
      price: 11999,
      cost: 9200,
      rating: 4.6,
      reviewCount: 43,
      specs: { Driver: "Custom 11mm Ceramic Driver", ANC: "Smart Active Noise Cancellation up to 45dB", HiRes: "LHDC 5.0 & LDAC Certified", ChatGPT: "ChatGPT Voice Integration" },
      tags: ["nothing", "earbuds", "chatgpt integration", "transparent", "budget hi-res"],
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&fit=crop",
    },
    {
      title: "Bose SoundLink Max Portable Bluetooth Speaker",
      slug: "bose-soundlink-max-speaker",
      brand: "Bose",
      cat: "audio-headphones",
      price: 36900,
      cost: 29000,
      rating: 4.8,
      reviewCount: 19,
      specs: { Durability: "IP67 Waterproof and Dustproof with silicone wrap", Battery: "Up to 20 hours of continuous play", Portability: "Removable soft rope carry handle" },
      tags: ["bose", "soundlink max", "boombox", "outdoor speaker", "waterproof"],
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&fit=crop",
    },
    {
      title: "Audio-Technica ATH-M50xBT2 Professional Monitor Headphones",
      slug: "audio-technica-ath-m50xbt2",
      brand: "Audio-Technica",
      cat: "audio-headphones",
      price: 17990,
      cost: 14200,
      rating: 4.9,
      reviewCount: 65,
      specs: { Drivers: "Proprietary 45mm Large-aperture Drivers", Sound: "Exceptional clarity across extended frequency range with deep bass", Battery: "Up to 50 hours on full charge" },
      tags: ["audio-technica", "ath-m50x", "studio monitor", "music production", "pure sound"],
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&fit=crop",
    },
    {
      title: "JBL Flip 6 Waterproof Portable Speaker",
      slug: "jbl-flip-6-waterproof-speaker",
      brand: "JBL",
      cat: "audio-headphones",
      price: 9999,
      cost: 7500,
      rating: 4.7,
      reviewCount: 82,
      specs: { Sound: "2-way speaker system with racetrack-shaped woofer", Rating: "IP67 waterproof and dustproof", Battery: "12 hours playtime", PartyBoost: "Link multiple speakers" },
      tags: ["jbl", "flip 6", "portable speaker", "party", "rugged", "poolside"],
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&fit=crop",
    },
    {
      title: "Shure SM7B Cardioid Dynamic Vocal Microphone",
      slug: "shure-sm7b-vocal-microphone",
      brand: "Shure",
      cat: "audio-headphones",
      price: 36990,
      cost: 29500,
      rating: 5.0,
      reviewCount: 46,
      specs: { Pattern: "Cardioid Polar Pattern", Shielding: "Electromagnetic hum shielding against computer interference", Mount: "Internal shock isolation" },
      tags: ["shure", "sm7b", "podcast mic", "broadcast vocal", "studio standard"],
      image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&fit=crop",
    },
    {
      title: "Rode Wireless PRO Dual-Channel Wireless Microphone System",
      slug: "rode-wireless-pro",
      brand: "Rode",
      cat: "audio-headphones",
      price: 39900,
      cost: 32000,
      rating: 4.9,
      reviewCount: 28,
      specs: { Recording: "32-bit Float On-board Recording (never clips)", Timecode: "Advanced SMPTE Timecode generator", Range: "Up to 260m line-of-sight transmission" },
      tags: ["rode", "wireless pro", "32-bit float", "lavalier mic", "vlogging audio"],
      image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&fit=crop",
    },
    {
      title: "Anker Soundcore Space One ANC Headphones",
      slug: "anker-soundcore-space-one",
      brand: "Anker",
      cat: "audio-headphones",
      price: 9999,
      cost: 7400,
      rating: 4.6,
      reviewCount: 55,
      specs: { ANC: "2x Stronger Voice Reduction ANC", Playtime: "40 hours with ANC on / 55 hours off", Audio: "LDAC Hi-Res Wireless Sound" },
      tags: ["anker", "soundcore", "budget anc", "travel headphones", "great value"],
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&fit=crop",
    },
    {
      title: "Sonos Era 100 Smart Speaker",
      slug: "sonos-era-100-smart-speaker",
      brand: "Sonos",
      cat: "audio-headphones",
      price: 29999,
      cost: 24000,
      rating: 4.8,
      reviewCount: 31,
      specs: { Audio: "Dual angled tweeters for stereo separation and 25% larger woofer", Connectivity: "WiFi 6, Bluetooth 5.0, USB-C Line In", Trueplay: "Trueplay tuning room acoustics" },
      tags: ["sonos", "era 100", "multiroom audio", "smart speaker", "hifi"],
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&fit=crop",
    },
    {
      title: "Beats Studio Pro Wireless Over-Ear Headphones",
      slug: "beats-studio-pro",
      brand: "Beats",
      cat: "audio-headphones",
      price: 28900,
      cost: 22800,
      rating: 4.5,
      reviewCount: 40,
      specs: { Platform: "Enhanced Apple and Android compatibility with One-Touch Pairing", Audio: "Lossless Audio via USB-C + Spatial Audio with dynamic head tracking" },
      tags: ["beats", "studio pro", "apple chip", "bass", "workout headphones"],
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&fit=crop",
    },
    {
      title: "Audioengine A2+ Wireless Desktop Speakers",
      slug: "audioengine-a2-plus-wireless",
      brand: "Audioengine",
      cat: "audio-headphones",
      price: 29990,
      cost: 23500,
      rating: 4.8,
      reviewCount: 25,
      specs: { Amplification: "Dual analog class A/B monolithic amplifiers", Inputs: "3.5mm stereo mini-jack, RCA, USB, Bluetooth aptX", Cabinets: "Hand-finished wood cabinets" },
      tags: ["audioengine", "desktop speakers", "desk audio", "audiophile", "bookshelf"],
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&fit=crop",
    },
    {
      title: "Sony SRS-XB100 Compact Bluetooth Speaker",
      slug: "sony-srs-xb100-speaker",
      brand: "Sony",
      cat: "audio-headphones",
      price: 4490,
      cost: 3300,
      rating: 4.7,
      reviewCount: 68,
      specs: { Sound: "Sound Diffusion Processor for expansive sound", Battery: "Up to 16 hours", Strap: "Multiway strap for hanging on backpacks" },
      tags: ["sony", "portable", "compact", "travel speaker", "waterproof"],
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&fit=crop",
    },
    {
      title: "Focusrite Scarlett 2i2 4th Gen USB Audio Interface",
      slug: "focusrite-scarlett-2i2-4th-gen",
      brand: "Focusrite",
      cat: "audio-headphones",
      price: 19999,
      cost: 15800,
      rating: 4.9,
      reviewCount: 37,
      specs: { Preamps: "Remote-controlled 4th Gen mic preamps with 69dB gain", Converters: "RedNet-grade converters with 120dB dynamic range", Features: "Auto Gain and Clip Safe" },
      tags: ["focusrite", "scarlett 2i2", "audio interface", "music recording", "podcasting"],
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&fit=crop",
    },
    {
      title: "OnePlus Buds Pro 2 with Spatial Audio",
      slug: "oneplus-buds-pro-2",
      brand: "OnePlus",
      cat: "audio-headphones",
      price: 11999,
      cost: 9100,
      rating: 4.6,
      reviewCount: 47,
      specs: { CoCreated: "Co-created with Dynaudio MelodyBoost Dual Drivers", ANC: "48dB Smart Adaptive Noise Cancellation", Latency: "54ms ultra-low latency" },
      tags: ["oneplus", "buds pro 2", "dynaudio", "spatial audio", "anc earbuds"],
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&fit=crop",
    },
    {
      title: "JBL Bar 500 5.1 Channel Soundbar with Dolby Atmos",
      slug: "jbl-bar-500-dolby-atmos",
      brand: "JBL",
      cat: "audio-headphones",
      price: 49999,
      cost: 39500,
      rating: 4.7,
      reviewCount: 22,
      specs: { Power: "590W Total System Power", Bass: "10-inch Wireless Subwoofer", Technology: "MultiBeam technology with 3D Dolby Atmos surround" },
      tags: ["jbl", "soundbar", "home theater", "dolby atmos", "wireless subwoofer"],
      image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&fit=crop",
    },

    // Smart Home & IoT (15 items)
    {
      title: "Roborock S8 Pro Ultra Robot Vacuum and Mop",
      slug: "roborock-s8-pro-ultra",
      brand: "Roborock",
      cat: "smart-home-iot",
      price: 129900,
      cost: 104000,
      rating: 4.9,
      reviewCount: 38,
      specs: { Dock: "All-in-one RockDock Ultra (self-washing, self-drying, self-emptying, self-refilling)", Suction: "6000Pa HyperForce Suction", Mopping: "VibraRise 2.0 sonic mopping system" },
      tags: ["roborock", "robot vacuum", "automated cleaning", "mop", "smart home"],
      image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&fit=crop",
    },
    {
      title: "Philips Hue White and Color Ambiance Starter Kit",
      slug: "philips-hue-starter-kit",
      brand: "Philips",
      cat: "smart-home-iot",
      price: 14999,
      cost: 11500,
      rating: 4.8,
      reviewCount: 56,
      specs: { Colors: "16 million colors + warm-to-cool white", Hub: "Hue Bridge included for Zigbee 3.0 mesh", Ecosystem: "Apple Home, Google Assistant, Alexa, Matter" },
      tags: ["philips hue", "smart lights", "zigbee", "matter", "mood lighting"],
      image: "https://images.unsplash.com/photo-1550524514-9b51458e0a13?w=800&fit=crop",
    },
    {
      title: "Amazon Echo Show 10 (3rd Gen) with Motion Screen",
      slug: "amazon-echo-show-10-3rd-gen",
      brand: "Amazon",
      cat: "smart-home-iot",
      price: 24999,
      cost: 19500,
      rating: 4.6,
      reviewCount: 42,
      specs: { Screen: "10.1-inch HD motorized screen moves automatically with you", Camera: "13MP camera with auto-framing", Hub: "Built-in Zigbee smart home hub" },
      tags: ["amazon", "alexa", "echo show", "smart display", "video calls"],
      image: "https://images.unsplash.com/photo-1543512214-318c7553f230?w=800&fit=crop",
    },
    {
      title: "Google Nest Cam (Battery) Indoor / Outdoor Security Camera",
      slug: "google-nest-cam-battery",
      brand: "Google",
      cat: "smart-home-iot",
      price: 16999,
      cost: 13200,
      rating: 4.7,
      reviewCount: 31,
      specs: { Intelligence: "Built-in smart alerts distinguish people, animals, and vehicles", Power: "Rechargeable battery or wired installation", Video: "1080p HDR video with Night Vision" },
      tags: ["google nest", "security camera", "cctv", "battery powered", "ai detection"],
      image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&fit=crop",
    },
    {
      title: "Eufy Smart Lock Touch & Wi-Fi Fingerprint Door Lock",
      slug: "eufy-smart-lock-touch-wifi",
      brand: "Eufy",
      cat: "smart-home-iot",
      price: 21999,
      cost: 17000,
      rating: 4.8,
      reviewCount: 29,
      specs: { Recognition: "0.3 second ultra-fast 3D fingerprint recognition", Connectivity: "Built-in Wi-Fi, remote unlocking from phone", Security: "BHMA Grade 2 certified security" },
      tags: ["eufy", "smart lock", "fingerprint lock", "home security", "door lock"],
      image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&fit=crop",
    },
    {
      title: "Nanoleaf Shapes Triangles Smarter Kit 9 Panels",
      slug: "nanoleaf-shapes-triangles-9pk",
      brand: "Nanoleaf",
      cat: "smart-home-iot",
      price: 18999,
      cost: 14800,
      rating: 4.7,
      reviewCount: 35,
      specs: { Features: "Rhythm Music Visualizer, Screen Mirroring, Touch Actions", Layout: "Modular Connect+ snap-together geometric panels", Compatibility: "Thread Border Router, Matter ready" },
      tags: ["nanoleaf", "rgb panels", "wall decor", "gaming room setup", "matter"],
      image: "https://images.unsplash.com/photo-1550524514-9b51458e0a13?w=800&fit=crop",
    },
    {
      title: "Dyson Purifier Hot+Cool Gen1 HP10",
      slug: "dyson-purifier-hot-cool-hp10",
      brand: "Dyson",
      cat: "smart-home-iot",
      price: 52900,
      cost: 42000,
      rating: 4.8,
      reviewCount: 33,
      specs: { Filtration: "HEPA H13 captures 99.95% of particles as small as 0.1 microns", DualMode: "Heats in winter, cools you in summer, purifies year-round", Circulation: "Air Multiplier technology oscillates up to 350 degrees" },
      tags: ["dyson", "air purifier", "room heater", "hepa filter", "clean air"],
      image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&fit=crop",
    },
    {
      title: "TP-Link Deco XE75 Pro AXE5400 Tri-Band WiFi 6E Mesh 2-Pack",
      slug: "tp-link-deco-xe75-pro-mesh",
      brand: "TP-Link",
      cat: "smart-home-iot",
      price: 24999,
      cost: 19500,
      rating: 4.8,
      reviewCount: 41,
      specs: { Frequency: "New 6 GHz Band dedicated to high speed backhaul", Coverage: "Up to 5,500 sq. ft. whole-home coverage", Speed: "5400 Mbps total bandwidth with 2.5G Multi-Gig port" },
      tags: ["tp-link", "mesh wifi", "wifi 6e", "high speed internet", "home networking"],
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&fit=crop",
    },
    {
      title: "Aqara Smart Hub M3 Matter Controller",
      slug: "aqara-smart-hub-m3-matter",
      brand: "Aqara",
      cat: "smart-home-iot",
      price: 11999,
      cost: 9000,
      rating: 4.9,
      reviewCount: 16,
      specs: { Protocols: "Matter controller, Thread border router, Zigbee 3.0, 360 Infrared blaster", Redundancy: "Local automation execution without internet dependency", Power: "PoE or USB-C powered" },
      tags: ["aqara", "matter hub", "zigbee", "thread", "home automation"],
      image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&fit=crop",
    },
    {
      title: "TP-Link Tapo C220 2K 4MP Pan/Tilt AI Home Security Camera",
      slug: "tp-link-tapo-c220-2k-cam",
      brand: "TP-Link",
      cat: "smart-home-iot",
      price: 2899,
      cost: 2100,
      rating: 4.6,
      reviewCount: 94,
      specs: { Resolution: "2K 4MP QHD Crystal Clear View", Tracking: "Smart Motion Tracking with 360 horizontal range", Detection: "Smart AI identifies people, pets, baby crying" },
      tags: ["tp-link", "tapo", "cctv", "indoor camera", "baby monitor", "cheap security"],
      image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&fit=crop",
    },
    {
      title: "Govee Envisat TV Backlight T2 with Dual Cameras",
      slug: "govee-envisat-tv-backlight-t2",
      brand: "Govee",
      cat: "smart-home-iot",
      price: 13499,
      cost: 10200,
      rating: 4.7,
      reviewCount: 30,
      specs: { Camera: "Dual camera color-match technology captures screen color in real time", LEDs: "Dense RGBIC light beads with zone division", Immersion: "Synonymous with movie and gaming immersion" },
      tags: ["govee", "tv backlight", "ambient lighting", "immersion", "rgbic"],
      image: "https://images.unsplash.com/photo-1550524514-9b51458e0a13?w=800&fit=crop",
    },
    {
      title: "SwitchBot Smart Curtain Rod 3 Motor",
      slug: "switchbot-curtain-rod-3",
      brand: "SwitchBot",
      cat: "smart-home-iot",
      price: 7999,
      cost: 5900,
      rating: 4.6,
      reviewCount: 25,
      specs: { Motor: "QuietDrift mode whisper-quiet < 25dB", Strength: "Pushes heavy curtains up to 16kg", Solar: "Optional solar panel for endless battery" },
      tags: ["switchbot", "automated curtains", "morning wake up", "smart home"],
      image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&fit=crop",
    },
    {
      title: "Eve Energy Smart Plug Matter over Thread",
      slug: "eve-energy-smart-plug-matter",
      brand: "Eve",
      cat: "smart-home-iot",
      price: 4999,
      cost: 3800,
      rating: 4.8,
      reviewCount: 22,
      specs: { Protocol: "Matter over Thread (no cloud registration needed)", Monitoring: "Measures energy consumption and estimated cost", MaxLoad: "16A / 3680W" },
      tags: ["eve", "smart plug", "thread", "matter", "energy monitoring"],
      image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&fit=crop",
    },
    {
      title: "Sensibo Air PRO Smart AC Controller with Air Quality Monitor",
      slug: "sensibo-air-pro-smart-ac",
      brand: "Sensibo",
      cat: "smart-home-iot",
      price: 14499,
      cost: 11000,
      rating: 4.6,
      reviewCount: 18,
      specs: { Compatibility: "Any AC or heat pump with an infrared remote", Sensors: "Measures TVOC air quality, CO2, temperature, and humidity", Geofencing: "Turns on before you arrive, turns off when last person leaves" },
      tags: ["sensibo", "smart ac", "energy saver", "air quality", "climate control"],
      image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&fit=crop",
    },
    {
      title: "Aqara Door and Window Sensor P2 Matter over Thread",
      slug: "aqara-door-sensor-p2-matter",
      brand: "Aqara",
      cat: "smart-home-iot",
      price: 3499,
      cost: 2600,
      rating: 4.7,
      reviewCount: 33,
      specs: { Standard: "Native Matter support via Thread", Battery: "Extra-long CR123A battery life up to 5 years", Triggers: "Instant open/close automation triggers" },
      tags: ["aqara", "door sensor", "home security", "thread", "matter automation"],
      image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&fit=crop",
    },

    // Wearables & Fitness (15 items)
    {
      title: "Apple Watch Ultra 2 GPS + Cellular 49mm Titanium",
      slug: "apple-watch-ultra-2-49mm",
      brand: "Apple",
      cat: "wearables-fitness",
      price: 89900,
      cost: 74000,
      rating: 4.9,
      reviewCount: 51,
      specs: { Case: "49mm aerospace-grade titanium case with flat sapphire front crystal", Brightness: "3000 nits peak brightness", Battery: "36 hours normal use / 72 hours low power mode", GPS: "Precision dual-frequency GPS" },
      tags: ["apple", "apple watch ultra 2", "diving", "running", "titanium smartwatch"],
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&fit=crop",
    },
    {
      title: "Garmin Fenix 7 Pro Sapphire Solar Edition",
      slug: "garmin-fenix-7-pro-sapphire-solar",
      brand: "Garmin",
      cat: "wearables-fitness",
      price: 84990,
      cost: 69000,
      rating: 4.9,
      reviewCount: 37,
      specs: { SolarCharging: "Power Sapphire lens adds up to 37 days of battery in smartwatch mode", Flashlight: "Built-in multi-LED flashlight with variable intensities", Mapping: "Preloaded TopoActive maps and ski resort maps" },
      tags: ["garmin", "fenix 7 pro", "marathon", "ultrarunning", "solar smartwatch", "triathlon"],
      image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&fit=crop",
    },
    {
      title: "Samsung Galaxy Watch 6 Classic 47mm LTE",
      slug: "samsung-galaxy-watch-6-classic-47mm",
      brand: "Samsung",
      cat: "wearables-fitness",
      price: 36999,
      cost: 29500,
      rating: 4.7,
      reviewCount: 44,
      specs: { Bezel: "Physically rotating tactile bezel", Health: "ECG, Blood Pressure, BIA Body Composition analysis", Screen: "Sapphire Crystal Super AMOLED" },
      tags: ["samsung", "galaxy watch 6 classic", "rotating bezel", "ecg", "wear os"],
      image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&fit=crop",
    },
    {
      title: "Oura Ring Gen 3 Horizon Stealth Finish",
      slug: "oura-ring-gen-3-stealth",
      brand: "Oura",
      cat: "wearables-fitness",
      price: 34999,
      cost: 27000,
      rating: 4.8,
      reviewCount: 42,
      specs: { Design: "Titanium smart ring weighing under 6 grams", Tracking: "Sleep staging, Readiness score, HRV, Daytime stress, Cycle prediction", Water: "Water resistant to 100 meters" },
      tags: ["oura", "oura ring", "smart ring", "sleep tracker", "recovery", "biohacking"],
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&fit=crop",
    },
    {
      title: "Apple Watch Series 9 GPS 45mm Midnight",
      slug: "apple-watch-series-9-45mm",
      brand: "Apple",
      cat: "wearables-fitness",
      price: 44900,
      cost: 37500,
      rating: 4.8,
      reviewCount: 63,
      specs: { Chip: "S9 SiP with 4-core Neural Engine", Gesture: "Double tap gesture for one-handed control", Brightness: "2000 nits edge-to-edge Retina display" },
      tags: ["apple", "watch series 9", "double tap", "fitness tracker", "health monitor"],
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&fit=crop",
    },
    {
      title: "Garmin Forerunner 265 Music GPS Running Watch",
      slug: "garmin-forerunner-265",
      brand: "Garmin",
      cat: "wearables-fitness",
      price: 42990,
      cost: 34500,
      rating: 4.9,
      reviewCount: 31,
      specs: { Display: "Vibrant AMOLED touchscreen with traditional buttons", Readiness: "Training Readiness score based on sleep and HRV", Battery: "Up to 13 days in smartwatch mode" },
      tags: ["garmin", "forerunner", "running watch", "vo2 max", "5k 10k half marathon"],
      image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&fit=crop",
    },
    {
      title: "WHOOP 4.0 Activity & Sleep Tracker Band",
      slug: "whoop-4-activity-sleep-tracker",
      brand: "WHOOP",
      cat: "wearables-fitness",
      price: 23999,
      cost: 18500,
      rating: 4.6,
      reviewCount: 39,
      specs: { Screenless: "Zero screen distractions, lightweight waterproof sensor", Metrics: "Strain, Recovery, Sleep Performance, Skin Temperature", OnTheGo: "Waterproof battery pack slides on while wearing" },
      tags: ["whoop", "fitness tracker", "strain", "sleep optimization", "athletes"],
      image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&fit=crop",
    },
    {
      title: "Fitbit Charge 6 Advanced Fitness & Health Tracker",
      slug: "fitbit-charge-6",
      brand: "Fitbit",
      cat: "wearables-fitness",
      price: 14999,
      cost: 11500,
      rating: 4.5,
      reviewCount: 47,
      specs: { HeartRate: "60% more accurate heart rate tracking on intense workouts", Google: "Google Maps turn-by-turn directions and Google Wallet", Battery: "7-day battery life" },
      tags: ["fitbit", "charge 6", "fitness band", "ecg", "sleep monitor", "google integration"],
      image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&fit=crop",
    },
    {
      title: "OnePlus Watch 2 with Dual-Engine Architecture",
      slug: "oneplus-watch-2",
      brand: "OnePlus",
      cat: "wearables-fitness",
      price: 24999,
      cost: 19500,
      rating: 4.7,
      reviewCount: 33,
      specs: { Battery: "Up to 100 hours in Smart Mode with Wear OS 4", DualChip: "Snapdragon W5 + BES2700 efficiency chip", Chassis: "Stainless steel chassis with sapphire crystal face" },
      tags: ["oneplus", "watch 2", "long battery wear os", "dual chip", "stainless steel"],
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&fit=crop",
    },
    {
      title: "Amazfit Balance Smartwatch with Body Composition",
      slug: "amazfit-balance-smartwatch",
      brand: "Amazfit",
      cat: "wearables-fitness",
      price: 21999,
      cost: 17000,
      rating: 4.6,
      reviewCount: 28,
      specs: { AI: "Zepp Coach AI tailored training plans and sleep coach", Display: "1.5-inch HD AMOLED 1500 nits peak brightness", GPS: "Industry-leading circularly-polarized GPS antenna" },
      tags: ["amazfit", "balance", "affordable premium", "14 day battery", "body composition"],
      image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&fit=crop",
    },
    {
      title: "Ultrahuman Ring AIR Raw Titanium",
      slug: "ultrahuman-ring-air",
      brand: "Ultrahuman",
      cat: "wearables-fitness",
      price: 28999,
      cost: 22500,
      rating: 4.7,
      reviewCount: 26,
      specs: { Weight: "Super-lightweight 2.4 grams", Metrics: "Circadian alignment, Sleep index, Movement score, CGM glucose syncing", Build: "Fighter-jet grade titanium" },
      tags: ["ultrahuman", "smart ring", "made in india", "sleep tracker", "metabolic health"],
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&fit=crop",
    },
    {
      title: "Coros PACE 3 Lightweight GPS Sport Watch",
      slug: "coros-pace-3-gps",
      brand: "Coros",
      cat: "wearables-fitness",
      price: 23990,
      cost: 18900,
      rating: 4.8,
      reviewCount: 22,
      specs: { Weight: "Only 30 grams with nylon band", Battery: "38 hours of continuous standard GPS usage", Sensors: "Dual-frequency satellite tracking and optical heart rate" },
      tags: ["coros", "pace 3", "runners favorite", "featherlight", "marathon training"],
      image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&fit=crop",
    },
    {
      title: "Withings ScanWatch 2 Hybrid Smartwatch",
      slug: "withings-scanwatch-2",
      brand: "Withings",
      cat: "wearables-fitness",
      price: 36999,
      cost: 29000,
      rating: 4.7,
      reviewCount: 17,
      specs: { Clinical: "Medical-grade ECG and blood oxygen SpO2 monitoring", Battery: "Exceptional 30-day battery life", Design: "Luxury analog stainless steel watch face with OLED complication" },
      tags: ["withings", "hybrid watch", "analog style", "medical grade ecg", "30 day battery"],
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&fit=crop",
    },
    {
      title: "Suunto Race Titanium GPS Adventure Watch",
      slug: "suunto-race-titanium",
      brand: "Suunto",
      cat: "wearables-fitness",
      price: 54990,
      cost: 44000,
      rating: 4.8,
      reviewCount: 15,
      specs: { Screen: "High definition 1.43-inch AMOLED display with digital crown", OfflineMaps: "Free offline outdoor terrain maps", Battery: "Up to 40 hours continuous high accuracy dual-band GPS" },
      tags: ["suunto", "outdoor watch", "trail running", "hiking", "offline maps"],
      image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&fit=crop",
    },
    {
      title: "Shokz OpenRun Pro Bone Conduction Sport Headphones",
      slug: "shokz-openrun-pro",
      brand: "Shokz",
      cat: "wearables-fitness",
      price: 15999,
      cost: 12200,
      rating: 4.8,
      reviewCount: 49,
      specs: { OpenEar: "9th Generation Bone Conduction Technology keeps ears open to traffic", Bass: "Two added bass enhancers for rich depth", Weather: "IP55 sweat resistant" },
      tags: ["shokz", "bone conduction", "outdoor running", "cycling safety", "open ear"],
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&fit=crop",
    },

    // Cameras & Content Gear (15 items)
    {
      title: "Sony Alpha 7 IV Full-Frame Mirrorless Camera Body",
      slug: "sony-alpha-7-iv-body",
      brand: "Sony",
      cat: "cameras-gear",
      price: 209990,
      cost: 175000,
      rating: 4.9,
      reviewCount: 42,
      specs: { Sensor: "33MP Full-Frame Exmor R Back-Illuminated CMOS", Autofocus: "759 phase-detection points with Real-time Eye AF for Humans, Animals, Birds", Video: "4K 60p 10-bit 4:2:2 recording with S-Cinetone" },
      tags: ["sony", "a7iv", "mirrorless camera", "full frame", "hybrid photo video"],
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&fit=crop",
    },
    {
      title: "Fujifilm X-T5 Mirrorless Camera with 16-80mm Lens",
      slug: "fujifilm-x-t5-with-16-80mm",
      brand: "Fujifilm",
      cat: "cameras-gear",
      price: 189999,
      cost: 156000,
      rating: 4.9,
      reviewCount: 35,
      specs: { Sensor: "40.2MP X-Trans CMOS 5 HR sensor", Dials: "Classic tactile mechanical dials for ISO, Shutter Speed, Exposure Compensation", Simulations: "19 Film Simulation modes including Nostalgic Neg and Classic Chrome" },
      tags: ["fujifilm", "xt5", "film simulation", "retro dials", "street photography"],
      image: "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=800&fit=crop",
    },
    {
      title: "DJI Osmo Pocket 3 Creator Combo",
      slug: "dji-osmo-pocket-3-creator-combo",
      brand: "DJI",
      cat: "cameras-gear",
      price: 54990,
      cost: 44000,
      rating: 4.9,
      reviewCount: 68,
      specs: { Sensor: "Massive 1-inch CMOS Sensor", Stabilization: "3-axis mechanical gimbal stabilization", Screen: "2-inch rotatable touchscreen for instant vertical/horizontal shooting", Mic: "DJI Mic 2 wireless transmitter included" },
      tags: ["dji", "osmo pocket 3", "vlogging camera", "1 inch sensor", "gimbal camera"],
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&fit=crop",
    },
    {
      title: "Canon EOS R6 Mark II Mirrorless Camera Body",
      slug: "canon-eos-r6-mark-ii",
      brand: "Canon",
      cat: "cameras-gear",
      price: 215995,
      cost: 178000,
      rating: 4.8,
      reviewCount: 27,
      specs: { Sensor: "24.2MP Full-Frame CMOS", Burst: "Up to 40 fps continuous electronic shutter shooting", Stabilization: "Up to 8 stops of Coordinated In-Body Image Stabilization" },
      tags: ["canon", "eos r6 mark ii", "sports photography", "action", "low light full frame"],
      image: "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=800&fit=crop",
    },
    {
      title: "Sony FE 24-70mm f/2.8 GM II G Master Lens",
      slug: "sony-fe-24-70mm-f2-8-gm-ii",
      brand: "Sony",
      cat: "cameras-gear",
      price: 189990,
      cost: 154000,
      rating: 5.0,
      reviewCount: 23,
      specs: { Optics: "Smallest and lightest constant f/2.8 standard zoom lens in its class", AF: "Four XD Linear Motors deliver blazing fast and quiet autofocus", Coating: "Nano AR Coating II eliminates ghosting and flare" },
      tags: ["sony", "g master", "24-70", "professional lens", "f2.8 zoom"],
      image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&fit=crop",
    },
    {
      title: "DJI Mini 4 Pro Fly More Combo Plus with RC 2 Controller",
      slug: "dji-mini-4-pro-fly-more-combo",
      brand: "DJI",
      cat: "cameras-gear",
      price: 99990,
      cost: 81000,
      rating: 4.9,
      reviewCount: 45,
      specs: { Weight: "Under 249g ultralight foldable drone", Safety: "Omnidirectional active obstacle sensing", Video: "4K 60p HDR True Vertical shooting + D-Log M 10-bit", FlightTime: "Up to 45 minutes with Intelligent Flight Battery Plus" },
      tags: ["dji", "mini 4 pro", "drone", "aerial photography", "sub 249g"],
      image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&fit=crop",
    },
    {
      title: "GoPro HERO12 Black Creator Edition",
      slug: "gopro-hero12-black-creator-edition",
      brand: "GoPro",
      cat: "cameras-gear",
      price: 52990,
      cost: 41500,
      rating: 4.7,
      reviewCount: 39,
      specs: { Video: "5.3K 60fps & 4K 120fps video recording with HDR", Stabilization: "HyperSmooth 6.0 with 360 Horizon Lock", Audio: "Wireless audio support for AirPods and Bluetooth mics", Grip: "Volta battery grip with over 5 hours recording" },
      tags: ["gopro", "hero12", "action camera", "waterproof", "vlogging bundle"],
      image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&fit=crop",
    },
    {
      title: "Sigma 24-70mm f/2.8 DG DN II Art Lens for Sony E-Mount",
      slug: "sigma-24-70mm-f2-8-dg-dn-ii-art",
      brand: "Sigma",
      cat: "cameras-gear",
      price: 109990,
      cost: 89000,
      rating: 4.8,
      reviewCount: 29,
      specs: { OpticalQuality: "Flagship Art line rendering comparable to native high-end primes", Autofocus: "HLA High-response Linear Actuator", Weight: "7% smaller and 65g lighter than predecessor" },
      tags: ["sigma", "art lens", "24-70 f2.8", "e mount", "sharpness value"],
      image: "https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=800&fit=crop",
    },
    {
      title: "Elgato Stream Deck MK.2 15 LCD Keys",
      slug: "elgato-stream-deck-mk2",
      brand: "Elgato",
      cat: "cameras-gear",
      price: 13999,
      cost: 10800,
      rating: 4.8,
      reviewCount: 57,
      specs: { Keys: "15 customizable LCD keys to trigger actions", Ecosystem: "Plugins for OBS, Twitch, YouTube, Spotify, Philips Hue", Faceplate: "Detachable magnetic faceplate for custom designs" },
      tags: ["elgato", "stream deck", "streaming gear", "macro keypad", "productivity"],
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&fit=crop",
    },
    {
      title: "DJI RS 3 Mini Lightweight Gimbal Stabilizer",
      slug: "dji-rs-3-mini-gimbal",
      brand: "DJI",
      cat: "cameras-gear",
      price: 24990,
      cost: 19800,
      rating: 4.7,
      reviewCount: 31,
      specs: { Payload: "Supports mirrorless setups up to 2 kg", Weight: "Weighs only 795g in portrait mode", Control: "Bluetooth shutter control without cables" },
      tags: ["dji", "rs 3 mini", "camera gimbal", "stabilizer", "cinematic video"],
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&fit=crop",
    },
    {
      title: "Aputure Amaran 200x S Bi-Color Studio LED Light",
      slug: "aputure-amaran-200x-s",
      brand: "Aputure",
      cat: "cameras-gear",
      price: 32990,
      cost: 26000,
      rating: 4.9,
      reviewCount: 20,
      specs: { Output: "200W Bi-Color Point-Source COB LED", ColorAccuracy: "Ultra-high SSI (Tungsten 89, D56 90), CRI 95+, TLCI 98+", Mount: "Universal Bowens Mount for softboxes and lanterns" },
      tags: ["aputure", "amaran 200x", "key light", "studio lighting", "youtube studio"],
      image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&fit=crop",
    },
    {
      title: "Rode Streamer X Audio Interface & Video Capture Card",
      slug: "rode-streamer-x",
      brand: "Rode",
      cat: "cameras-gear",
      price: 33990,
      cost: 27000,
      rating: 4.7,
      reviewCount: 16,
      specs: { Video: "4K30 Capture and 4K60 HDR Pass-through", Audio: "Studio-grade Revolution Preamp with Neutrik combo jack and internal APHEX processing", Wireless: "Built-in receiver for RODE Wireless Series IV microphones" },
      tags: ["rode", "streamer x", "capture card", "all in one", "streaming"],
      image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&fit=crop",
    },
    {
      title: "Peak Design Everyday Backpack 20L V2 Charcoal",
      slug: "peak-design-everyday-backpack-20l",
      brand: "Peak Design",
      cat: "cameras-gear",
      price: 28990,
      cost: 23000,
      rating: 4.9,
      reviewCount: 48,
      specs: { Dividers: "3 configurable FlexFold dividers for camera gear and daily carry", Access: "Dual weatherproof side zips + MagLatch top access", Laptop: "Dedicated protective sleeve fits 15-inch laptops" },
      tags: ["peak design", "camera bag", "everyday carry", "weatherproof", "edc backpack"],
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&fit=crop",
    },
    {
      title: "SanDisk Extreme PRO 128GB UHS-II SDXC Memory Card",
      slug: "sandisk-extreme-pro-128gb-uhs-ii",
      brand: "SanDisk",
      cat: "cameras-gear",
      price: 9999,
      cost: 7500,
      rating: 4.8,
      reviewCount: 53,
      specs: { ReadSpeed: "Up to 300 MB/s", WriteSpeed: "Up to 260 MB/s", Rating: "V90 Video Speed Class for uninterrupted 8K & 4K recording" },
      tags: ["sandisk", "sd card", "uhs-ii", "v90", "fast buffer"],
      image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&fit=crop",
    },
    {
      title: "Manfrotto Befree Advanced Carbon Fiber Travel Tripod",
      slug: "manfrotto-befree-advanced-carbon",
      brand: "Manfrotto",
      cat: "cameras-gear",
      price: 32900,
      cost: 25500,
      rating: 4.8,
      reviewCount: 22,
      specs: { Material: "100% Carbon fiber leg tubes for maximum rigidity and light weight", Head: "Advanced 494 Center Ball Head with independent panoramic knob", Capacity: "Supports equipment up to 9 kg, folds down to 41 cm" },
      tags: ["manfrotto", "tripod", "carbon fiber", "travel photography", "sturdy"],
      image: "https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?w=800&fit=crop",
    },
  ];

  const createdProducts = [];
  const retailers = [retailer1Profile, retailer2Profile, retailer3Profile];

  for (let i = 0; i < baseProducts.length; i++) {
    const item = baseProducts[i];
    const category = categoryMap[item.cat];

    const prod = await prisma.product.create({
      data: {
        title: item.title,
        slug: item.slug,
        description: `${item.title} offers industry-leading performance, refined design, and premium components for demanding users. Tested and verified by ShopSense intelligence.`,
        brand: item.brand,
        categoryId: category.id,
        basePrice: item.price,
        rating: item.rating,
        reviewCount: item.reviewCount,
        specsJson: JSON.stringify(item.specs),
        tagsJson: JSON.stringify(item.tags),
      },
    });

    // Primary image
    await prisma.productImage.create({
      data: {
        productId: prod.id,
        url: item.image,
        altText: item.title,
        isPrimary: true,
        sortOrder: 0,
      },
    });

    // Create 1-2 variants
    const v1 = await prisma.productVariant.create({
      data: {
        productId: prod.id,
        sku: `SKU-${i + 1001}-${item.slug.substring(0, 8).toUpperCase()}`,
        name: "Standard Edition",
        price: item.price,
        costPrice: item.cost,
        compareAtPrice: Math.round(item.price * 1.15),
        attributesJson: JSON.stringify({ Edition: "Standard" }),
      },
    });

    // Assign to 1-2 retailers
    const primaryRetailer = retailers[i % retailers.length];
    await prisma.retailerProduct.create({
      data: {
        retailerId: primaryRetailer.id,
        productId: prod.id,
        price: item.price,
        costPrice: item.cost,
        sku: `${primaryRetailer.storeSlug.toUpperCase()}-${i + 100}`,
        status: "ACTIVE",
      },
    });

    // Create inventory with varied realistic conditions:
    // Some are healthy (40-120), some are low stock (< reorder point, e.g. 4-8), some slow-moving
    let qty = 45;
    let reorderPoint = 15;
    let safetyStock = 5;

    if (i % 6 === 0) {
      // Low stock danger product!
      qty = 4;
      reorderPoint = 15;
      safetyStock = 5;
    } else if (i % 5 === 0) {
      // Slow moving product with excess stock
      qty = 110;
      reorderPoint = 12;
      safetyStock = 4;
    } else {
      qty = 35 + (i * 3) % 40;
    }

    const inv = await prisma.inventory.create({
      data: {
        retailerId: primaryRetailer.id,
        productId: prod.id,
        variantId: v1.id,
        quantity: qty,
        reservedQuantity: 0,
        safetyStock,
        reorderPoint,
        leadTimeDays: 7,
        location: "Main Tech Warehouse Bay A",
      },
    });

    // Initial Restock movement
    await prisma.inventoryMovement.create({
      data: {
        inventoryId: inv.id,
        changeQuantity: qty + 10,
        previousQuantity: 0,
        newQuantity: qty + 10,
        reason: "RESTOCK",
        referenceId: `INIT-PO-${1000 + i}`,
      },
    });

    // Add historical price points
    await prisma.priceHistory.createMany({
      data: [
        {
          productId: prod.id,
          retailerId: primaryRetailer.id,
          price: Math.round(item.price * 1.08),
          recordedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          reason: "INITIAL_LAUNCH",
        },
        {
          productId: prod.id,
          retailerId: primaryRetailer.id,
          price: Math.round(item.price * 0.95),
          recordedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          reason: "FESTIVE_DISCOUNT",
        },
        {
          productId: prod.id,
          retailerId: primaryRetailer.id,
          price: item.price,
          recordedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          reason: "REGULAR_PRICE",
        },
      ],
    });

    // Add 2 realistic reviews with sentiment and aspect analytics
    await prisma.productReview.createMany({
      data: [
        {
          productId: prod.id,
          userId: customerUser.id,
          rating: item.rating >= 4.8 ? 5 : 4,
          title: "Exceptional quality and performance",
          comment: `I have been using this for 3 months now. The build quality is top-notch, battery life easily meets expectations, and performance is completely stutter-free. Highly recommended!`,
          verifiedPurchase: true,
          sentimentScore: 0.88,
          aspectsJson: JSON.stringify({
            quality: "positive",
            performance: "positive",
            battery: "positive",
            value_for_money: "neutral",
          }),
          createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        },
        {
          productId: prod.id,
          userId: customerUser2.id,
          rating: 4,
          title: "Great everyday product, slightly premium price",
          comment: `Works exactly as advertised. Beautiful ergonomics and fast setup. Only small critique is the cable could be longer, but otherwise zero regrets purchasing.`,
          verifiedPurchase: true,
          sentimentScore: 0.65,
          aspectsJson: JSON.stringify({
            ergonomics: "positive",
            setup: "positive",
            value_for_money: "neutral",
            accessories: "negative",
          }),
          createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        },
      ],
    });

    createdProducts.push({ prod, retailer: primaryRetailer, inv, item });
  }

  // 6. Generate 180 Days of Historical Sales Events & Real Orders for Time-Series Forecasting
  console.log("📈 Synthesizing 180 days of realistic sales time-series for forecasting & analytics...");

  const now = new Date();
  const salesEventsToCreate = [];

  for (const { prod, retailer, item } of createdProducts) {
    // Generate daily sales series spanning 180 days
    const baseDailyVelocity = Math.max(0.2, (item.price < 25000 ? 3.5 : item.price < 80000 ? 1.8 : 0.8));

    for (let dayOffset = 180; dayOffset >= 0; dayOffset--) {
      const date = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Seasonal / weekend uplift multiplier
      let multiplier = isWeekend ? 1.4 : 1.0;
      if (dayOffset >= 50 && dayOffset <= 65) {
        multiplier *= 1.8; // Simulated Festive Sale spike
      }

      // Poisson-like / deterministic distribution
      const noise = ((dayOffset * 7 + prod.title.length * 13) % 10) / 10;
      const expectedUnits = baseDailyVelocity * multiplier * (0.6 + noise * 0.8);
      const units = Math.floor(expectedUnits);

      if (units > 0) {
        const revenue = units * item.price;
        const cost = units * (item.cost || item.price * 0.8);
        salesEventsToCreate.push({
          retailerId: retailer.id,
          productId: prod.id,
          units,
          revenue,
          cost,
          profit: revenue - cost,
          eventDate: date,
        });
      }
    }
  }

  console.log(`Inserting ${salesEventsToCreate.length} historical sales records in batches...`);
  const chunkSize = 500;
  for (let i = 0; i < salesEventsToCreate.length; i += chunkSize) {
    await prisma.salesEvent.createMany({
      data: salesEventsToCreate.slice(i, i + chunkSize),
    });
  }

  // 7. Create Demo Orders for Customer
  console.log("🛒 Creating realistic customer order history...");
  const sampleProducts = createdProducts.slice(0, 3);
  const sampleOrder = await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-9812",
      userId: customerUser.id,
      retailerId: retailer1Profile.id,
      status: "DELIVERED",
      paymentStatus: "PAID",
      paymentMethod: "Credit Card (Visa ending in 4242)",
      subtotal: sampleProducts[0].item.price,
      tax: Math.round(sampleProducts[0].item.price * 0.18),
      shipping: 0,
      discount: 2000,
      totalAmount: Math.round(sampleProducts[0].item.price * 1.18) - 2000,
      shippingAddressJson: JSON.stringify({
        fullName: "Rahul Sharma",
        line1: "Flat 402, Green Glen Residency, Outer Ring Road",
        city: "Bengaluru",
        state: "Karnataka",
        postalCode: "560103",
      }),
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.orderItem.create({
    data: {
      orderId: sampleOrder.id,
      productId: sampleProducts[0].prod.id,
      titleSnapshot: sampleProducts[0].prod.title,
      priceSnapshot: sampleProducts[0].item.price,
      costSnapshot: sampleProducts[0].item.cost,
      quantity: 1,
    },
  });

  await prisma.payment.create({
    data: {
      orderId: sampleOrder.id,
      amount: sampleOrder.totalAmount,
      status: "PAID",
      provider: "DEMO_STRIPE",
      transactionId: "txn_demo_981244321",
    },
  });

  await prisma.shipment.create({
    data: {
      orderId: sampleOrder.id,
      trackingNumber: "BD-EXP-981244321",
      carrier: "BlueDart Express",
      status: "DELIVERED",
      deliveredAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    },
  });

  // 8. Generate Automated Retailer Business Insights for Low-Stock items
  console.log("💡 Generating initial business intelligence alerts...");
  const lowStockItems = createdProducts.filter((p) => p.inv.quantity <= p.inv.reorderPoint);

  for (const item of lowStockItems.slice(0, 4)) {
    await prisma.businessInsight.create({
      data: {
        retailerId: item.retailer.id,
        title: `Critical Low Stock Warning: ${item.prod.title}`,
        insightType: "LOW_STOCK_RISK",
        severity: "CRITICAL",
        summary: `Current stock of ${item.inv.quantity} units is below the reorder point of ${item.inv.reorderPoint} units. At current velocity, stockout will occur within 3-4 days.`,
        recommendation: `Issue purchase order for at least 25 units from authorized supplier immediately to avoid stockout penalty.`,
        metricsJson: JSON.stringify({
          currentStock: item.inv.quantity,
          reorderPoint: item.inv.reorderPoint,
          safetyStock: item.inv.safetyStock,
          leadTimeDays: item.inv.leadTimeDays,
          estimatedDaysRemaining: 3.5,
        }),
      },
    });

    await prisma.notification.create({
      data: {
        retailerId: item.retailer.id,
        title: `Low Stock Alert: ${item.prod.title}`,
        message: `Only ${item.inv.quantity} units remaining in Main Tech Warehouse. Reorder threshold breached.`,
        type: "LOW_STOCK",
        link: `/retailer/inventory`,
      },
    });
  }

  console.log("✅ Seed completed successfully!");
  console.log(`📊 Total catalog products created: ${createdProducts.length}`);
  console.log(`📈 Total historical sales records: ${salesEventsToCreate.length}`);
  console.log(`👥 Demo Accounts:`);
  console.log(`   Customer: customer@shopsense.com / Password123!`);
  console.log(`   Retailer: apex@shopsense.com / Password123!`);
  console.log(`   Admin:    admin@shopsense.com / Password123!`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
