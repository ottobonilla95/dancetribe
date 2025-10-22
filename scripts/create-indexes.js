// Essential database indexes for DanceCircle performance
// 🛡️ SAFETY: Indexes are 100% safe - they only speed up reads, never modify data
// 
// HOW TO USE:
// 1. Connect to MongoDB Compass or mongosh
// 2. Select your database
// 3. Copy-paste these commands one by one
// 4. If you want to remove them later: db.collection.dropIndex("indexName")
//
// WHEN TO RUN: Only when you have 500+ users and pages are getting slow

// 1. User collection indexes
db.users.createIndex({ "city": 1, "isProfileComplete": 1 });
db.users.createIndex({ "citiesVisited": 1, "isProfileComplete": 1 });
db.users.createIndex({ "danceStyles.danceStyle": 1, "isProfileComplete": 1 });
db.users.createIndex({ "danceStyles.danceStyle": 1, "danceStyles.level": 1 });

// 2. City collection indexes  
db.cities.createIndex({ "name": 1 });
db.cities.createIndex({ "country": 1 });
db.cities.createIndex({ "continent": 1 });
db.cities.createIndex({ "rank": 1, "population": -1 });

// 3. Dance style collection indexes
db.dancestyles.createIndex({ "name": 1 });
db.dancestyles.createIndex({ "category": 1 });
db.dancestyles.createIndex({ "isActive": 1 });

// 4. Compound indexes for common queries
db.users.createIndex({ "isProfileComplete": 1, "city": 1, "danceStyles.danceStyle": 1 });

console.log("✅ All performance indexes created!");
console.log("🚀 Your queries should be much faster now!");

// When to run this:
// - When you have 500+ users
// - When city/dance pages are getting slow
// - Before hitting 1,000 users per city 