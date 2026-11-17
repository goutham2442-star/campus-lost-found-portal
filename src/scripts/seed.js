require("dotenv").config();
const { initDB } = require("../config/db");
const UserRepository = require("../repositories/UserRepository");
const ItemRepository = require("../repositories/ItemRepository");
const ClaimRepository = require("../repositories/ClaimRepository");
const NotificationRepository = require("../repositories/NotificationRepository");

async function seedDatabase() {
  try {
    console.log("[Seed] Initializing database engine...");
    await initDB();

    console.log("[Seed] Clearing old demo collections...");
    await Promise.all([
      UserRepository.clearAll(),
      ItemRepository.clearAll(),
      ClaimRepository.clearAll(),
      NotificationRepository.clearAll()
    ]);

    console.log("[Seed] Creating administrative and student users...");

    // 1. Admin account
    const adminEmail = process.env.ADMIN_EMAIL || "admin@saiuniversity.edu.in";
    const adminPassword = process.env.ADMIN_PASSWORD || "AdminSaiPass2026!";
    const admin = await UserRepository.create({
      name: process.env.ADMIN_NAME || "Campus Administrator",
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      department: "Campus Security & Student Affairs",
      phone: "+91 98765 43210"
    });

    // 2. Sample students
    const student1 = await UserRepository.create({
      name: "Aarav Sharma",
      email: "aarav.sharma@saiuniversity.edu.in",
      password: "password123",
      role: "student",
      department: "Computer Science",
      phone: "+91 91234 56789"
    });

    const student2 = await UserRepository.create({
      name: "Pooja Sundaram",
      email: "pooja.sundaram@saiuniversity.edu.in",
      password: "password123",
      role: "student",
      department: "Data Science",
      phone: "+91 92345 67890"
    });

    const student3 = await UserRepository.create({
      name: "Rohan Varma",
      email: "rohan.varma@saiuniversity.edu.in",
      password: "password123",
      role: "student",
      department: "Law & Governance",
      phone: "+91 93456 78901"
    });

    console.log("[Seed] Creating realistic campus lost & found records (12+ items)...");

    const s1Id = (student1._id || student1.id).toString();
    const s2Id = (student2._id || student2.id).toString();
    const s3Id = (student3._id || student3.id).toString();

    const sampleItems = [
      {
        name: "Black wireless earbuds",
        category: "Electronics",
        type: "Found",
        location: "Library, Ground Floor",
        date: "2026-10-22",
        description: "Sony noise-canceling case with a small scratch on the lid. Left near table 4.",
        status: "Active",
        emoji: "🎧",
        owner: s2Id
      },
      {
        name: "Blue metal water bottle",
        category: "Accessories",
        type: "Lost",
        location: "Block C, Room 204",
        date: "2026-10-23",
        description: "Milton 1L blue metal bottle with a NASA astronaut sticker near the base.",
        status: "Active",
        emoji: "🧴",
        owner: s1Id
      },
      {
        name: "Sai University Student ID Card",
        category: "ID & Cards",
        type: "Found",
        location: "Cafeteria Entrance",
        date: "2026-10-21",
        description: "Sai University ID card found near cashier desk. Name on card starts with initial R.",
        status: "Active",
        emoji: "🪪",
        owner: s1Id
      },
      {
        name: "Keychain with two bike keys",
        category: "Keys",
        type: "Found",
        location: "Sports Ground Pavilion",
        date: "2026-10-20",
        description: "Two Honda motorcycle keys attached to a green paracord lanyard.",
        status: "Active",
        emoji: "🔑",
        owner: s2Id
      },
      {
        name: "Data Structures handwritten notebook",
        category: "Books & Notes",
        type: "Lost",
        location: "Computer Lab 2",
        date: "2026-10-19",
        description: "Spiral Classmate notebook with handwritten algorithms and trees diagrams.",
        status: "Active",
        emoji: "📓",
        owner: s3Id
      },
      {
        name: "Grey oversized hoodie",
        category: "Clothing",
        type: "Found",
        location: "Auditorium Main Row G",
        date: "2026-10-18",
        description: "Nike grey hoodie, size L. Left behind after guest lecture seminar.",
        status: "Active",
        emoji: "🧥",
        owner: s1Id
      },
      {
        name: "SanDisk 64GB USB Drive",
        category: "Electronics",
        type: "Lost",
        location: "Innovation Lab Workstation 7",
        date: "2026-10-17",
        description: "Metallic silver SanDisk ultra dual drive with Python project files.",
        status: "Active",
        emoji: "💾",
        owner: s2Id
      },
      {
        name: "Casio FX-991CW Scientific Calculator",
        category: "Electronics",
        type: "Found",
        location: "Exam Hall 1, Desk 32",
        date: "2026-10-16",
        description: "Scientific calculator with solar panel and transparent protective case.",
        status: "Active",
        emoji: "🧮",
        owner: s3Id
      },
      {
        name: "Insulated lunch box bag",
        category: "Accessories",
        type: "Lost",
        location: "Hostel Dining Hall",
        date: "2026-10-15",
        description: "Grey fabric lunch bag containing two round stainless steel containers.",
        status: "Active",
        emoji: "🍱",
        owner: s1Id
      },
      {
        name: "Dark blue windproof umbrella",
        category: "Accessories",
        type: "Found",
        location: "Main Admin Building Lobby",
        date: "2026-10-14",
        description: "Automatic push-button compact navy blue umbrella with wooden handle.",
        status: "Active",
        emoji: "☂️",
        owner: s2Id
      },
      {
        name: "Logitech Wireless Mouse M331",
        category: "Electronics",
        type: "Found",
        location: "Design Studio Room 102",
        date: "2026-10-12",
        description: "Silent red and black wireless optical mouse with USB receiver enclosed.",
        status: "Active",
        emoji: "🖱️",
        owner: s3Id
      },
      {
        name: "Framed prescription reading glasses",
        category: "Accessories",
        type: "Lost",
        location: "Central Library Reading Room",
        date: "2026-10-11",
        description: "Black matte frame Ray-Ban reading glasses in hard brown leather pouch.",
        status: "Active",
        emoji: "👓",
        owner: s1Id
      }
    ];

    const insertedItems = [];
    for (const it of sampleItems) {
      const created = await ItemRepository.create(it);
      insertedItems.push(created);
    }
    console.log(`[Seed] Seeded ${insertedItems.length} items successfully.`);

    // Sample claim on the first found item (earbuds)
    const firstItemId = insertedItems[0]._id || insertedItems[0].id;
    await ClaimRepository.create({
      item: firstItemId.toString(),
      claimant: s1Id,
      contact: "aarav.sharma@saiuniversity.edu.in | +91 91234 56789",
      proof: "The Sony earbuds serial number starts with 873A, and left ear tip has a blue foam replacement cushion.",
      status: "Pending"
    });

    // Sample notification
    await NotificationRepository.create({
      user: s1Id,
      title: "Welcome to CampusFind!",
      message: "Your campus account is ready. Report lost items or help someone find theirs.",
      type: "general"
    });

    console.log("[Seed] Database seeded successfully!");
    console.log(`[Seed] Administrator account:`);
    console.log(`       Email: ${adminEmail}`);
    console.log(`       Password: ${adminPassword}`);
    console.log(`[Seed] Student account:`);
    console.log(`       Email: aarav.sharma@saiuniversity.edu.in`);
    console.log(`       Password: password123`);
  } catch (err) {
    console.error("[Seed] Error seeding database:", err);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

module.exports = seedDatabase;
