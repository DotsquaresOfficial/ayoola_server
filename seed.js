
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Conversion = require('./models/Conversion');
const DashboardStats = require('./models/DashboardStats');
const UserStats = require('./models/UserStats');
const PointStats = require('./models/PointStats');
const StepCoinStats = require('./models/StepCoinStats');
const ConversionStats = require('./models/ConversionStats');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Function to generate a random number between min and max
const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

// Function to generate a past date given the number of days ago
const getPastDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

// Function to generate random IP address
const getRandomIP = () => {
  return `${getRandomNumber(1, 255)}.${getRandomNumber(0, 255)}.${getRandomNumber(0, 255)}.${getRandomNumber(1, 255)}`;
};

// Function to generate random wallet address
const getRandomWalletAddress = () => {
  const chars = '0123456789abcdef';
  let result = '0x';
  for (let i = 0; i < 40; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Locations for random assignment
const locations = [
  'New York, USA', 'London, UK', 'Tokyo, Japan', 'Sydney, Australia', 
  'Paris, France', 'Berlin, Germany', 'Toronto, Canada', 'Mumbai, India',
  'Beijing, China', 'Dubai, UAE', 'São Paulo, Brazil', 'Cape Town, South Africa'
];

// Function to get random location
const getRandomLocation = () => {
  return locations[Math.floor(Math.random() * locations.length)];
};

// Status types for conversions
const conversionStatuses = ['pending', 'approved', 'suspected', 'rejected'];
const userStatuses = ['active', 'inactive', 'blocked'];

// Functions to seed specific models
const seedUsers = async () => {
  // Clear existing users
  await User.deleteMany({});

  // Create admin user
  const adminSalt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('admin123', adminSalt);
  
  await User.create({
    name: 'Admin User',
    email: 'admin@stepcoin.com',
    password: adminHash,
    role: 'admin',
    status: 'active',
    stepPoints: 5000,
    walletAddress: getRandomWalletAddress(),
    createdAt: getPastDate(180)
  });

  // Create regular users
  const numUsers = 50;
  const userPromises = [];

  for (let i = 1; i <= numUsers; i++) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(`user${i}123`, salt);
    
    const daysAgo = getRandomNumber(1, 180);
    
    userPromises.push(User.create({
      name: `User ${i}`,
      email: `user${i}@example.com`,
      password: hash,
      role: 'user',
      status: userStatuses[Math.floor(Math.random() * userStatuses.length)],
      stepPoints: getRandomNumber(100, 10000),
      walletAddress: getRandomWalletAddress(),
      createdAt: getPastDate(daysAgo)
    }));
  }

  await Promise.all(userPromises);
  console.log(`Seeded 1 admin and ${numUsers} regular users`);
};

const seedConversions = async () => {
  // Clear existing conversions
  await Conversion.deleteMany({});

  // Get all users except admin
  const users = await User.find({ role: 'user' });
  
  if (users.length === 0) {
    console.log('No users found. Skipping conversions.');
    return;
  }

  const conversionPromises = [];
  const conversionsPerUser = 5; // Average conversions per user
  
  users.forEach(user => {
    const numConversions = getRandomNumber(0, conversionsPerUser * 2);
    
    for (let i = 0; i < numConversions; i++) {
      const daysAgo = getRandomNumber(1, 90);
      const requestDate = getPastDate(daysAgo);
      
      const status = conversionStatuses[Math.floor(Math.random() * conversionStatuses.length)];
      const stepsConverted = getRandomNumber(500, 8000);
      const coinsEarned = Math.floor(stepsConverted / 100); // 100 steps = 1 coin
      
      const conversion = {
        user: user._id,
        stepsConverted,
        coinsEarned,
        status,
        requestDate,
        walletAddress: user.walletAddress,
        ipAddress: getRandomIP(),
        location: getRandomLocation()
      };
      
      // Add processedDate if the status is not pending
      if (status !== 'pending') {
        // Process date is 1-24 hours after request date
        const processedDate = new Date(requestDate);
        processedDate.setHours(processedDate.getHours() + getRandomNumber(1, 24));
        conversion.processedDate = processedDate;
      }
      
      conversionPromises.push(Conversion.create(conversion));
    }
  });

  await Promise.all(conversionPromises);
  console.log('Seeded conversion requests');
};

const seedDashboardStats = async () => {
  // Clear existing stats
  await DashboardStats.deleteMany({});
  
  // Create stats for the last 30 days
  const statPromises = [];
  
  for (let i = 30; i >= 0; i--) {
    const date = getPastDate(i);
    
    // Generate increasing stats over time
    const baseUsers = 1000;
    const dailyGrowth = 50;
    const totalUsers = baseUsers + (30 - i) * dailyGrowth;
    const activeUsers = Math.floor(totalUsers * 0.7);
    const inactiveUsers = Math.floor(totalUsers * 0.2);
    const blockedUsers = totalUsers - activeUsers - inactiveUsers;
    
    const totalSteps = totalUsers * getRandomNumber(800, 1200);
    const totalCoins = Math.floor(totalSteps / 100);
    
    const pendingConversions = getRandomNumber(5, 20);
    const approvedConversions = getRandomNumber(50, 100);
    const suspectedConversions = getRandomNumber(3, 10);
    const rejectedConversions = getRandomNumber(1, 8);
    
    statPromises.push(DashboardStats.create({
      date,
      totalUsers,
      activeUsers,
      inactiveUsers,
      blockedUsers,
      totalSteps,
      totalCoins,
      pendingConversions,
      approvedConversions,
      suspectedConversions,
      rejectedConversions
    }));
  }
  
  await Promise.all(statPromises);
  console.log('Seeded dashboard stats');
};

const seedUserStats = async () => {
  // Clear existing user stats
  await UserStats.deleteMany({});
  
  // Create stats for the last 180 days
  const statPromises = [];
  
  let totalUsers = 800;
  let activeUsers = 560;  // 70% of total initially
  
  for (let i = 180; i >= 0; i--) {
    const date = getPastDate(i);
    
    // Add some random growth with occasional spikes
    const userGrowth = getRandomNumber(20, 80);
    const newUsers = i % 7 === 0 ? userGrowth * 2 : userGrowth;  // Spike on weekends
    
    totalUsers += newUsers;
    activeUsers = Math.floor(totalUsers * (0.65 + Math.random() * 0.15)); // 65-80% active
    
    statPromises.push(UserStats.create({
      date,
      totalUsers,
      activeUsers,
      newUsers
    }));
  }
  
  await Promise.all(statPromises);
  console.log('Seeded user stats');
};

const seedPointStats = async () => {
  // Clear existing point stats
  await PointStats.deleteMany({});
  
  // Create stats for the last 180 days
  const statPromises = [];
  
  let cumulativeEarned = 1000000;
  let cumulativeConverted = 400000;
  
  for (let i = 180; i >= 0; i--) {
    const date = getPastDate(i);
    
    // New points earned and converted each day
    const dayEarned = getRandomNumber(8000, 15000);
    
    // Conversion rate varies between 40-60%
    const conversionRate = 0.4 + Math.random() * 0.2;
    const dayConverted = Math.floor(dayEarned * conversionRate);
    
    cumulativeEarned += dayEarned;
    cumulativeConverted += dayConverted;
    
    statPromises.push(PointStats.create({
      date,
      earned: dayEarned,
      converted: dayConverted
    }));
  }
  
  await Promise.all(statPromises);
  console.log('Seeded point stats');
};

const seedStepCoinStats = async () => {
  // Clear existing STEP coin stats
  await StepCoinStats.deleteMany({});
  
  // Create stats for the last 365 days
  const statPromises = [];
  
  // Initial values
  let lastPrice = 0.05;
  let circulatingSupply = 5000000;
  
  for (let i = 365; i >= 0; i--) {
    const date = getPastDate(i);
    
    // Gradually increase price over time with some volatility
    const priceChange = (Math.random() - 0.3) * 0.01; // -0.3% to +0.7% daily change
    let price = lastPrice * (1 + priceChange);
    price = Math.max(0.01, Math.min(0.5, price));  // Keep price between $0.01 and $0.50
    
    // Round to 2 decimal places
    price = Math.round(price * 100) / 100;
    
    // Gradually increase circulating supply
    circulatingSupply += getRandomNumber(5000, 20000);
    circulatingSupply = Math.min(100000000, circulatingSupply); // Max supply is 100M
    
    const marketCap = price * circulatingSupply;
    const volume24h = marketCap * (0.05 + Math.random() * 0.15); // 5-20% of market cap
    const changePercentage24h = (price / lastPrice - 1) * 100;
    
    statPromises.push(StepCoinStats.create({
      date,
      price,
      marketCap,
      circulatingSupply,
      volume24h,
      changePercentage24h
    }));
    
    lastPrice = price;
  }
  
  await Promise.all(statPromises);
  console.log('Seeded STEP coin stats');
};

const seedConversionStats = async () => {
  // Clear existing conversion stats
  await ConversionStats.deleteMany({});
  
  // Create stats for the last 90 days
  const statPromises = [];
  
  for (let i = 90; i >= 0; i--) {
    const date = getPastDate(i);
    
    // Generate daily conversions
    const totalRequests = getRandomNumber(8, 25);
    
    // Distribute by size
    const smallConversions = Math.floor(totalRequests * 0.3);
    const mediumConversions = Math.floor(totalRequests * 0.5);
    const largeConversions = totalRequests - smallConversions - mediumConversions;
    
    // Distribute by status
    const approvedConversions = Math.floor(totalRequests * 0.7);
    const pendingConversions = Math.floor(totalRequests * 0.15);
    const suspectedConversions = Math.floor(totalRequests * 0.1);
    const rejectedConversions = totalRequests - approvedConversions - pendingConversions - suspectedConversions;
    
    // Distribute by processor
    const systemApprovals = Math.floor(approvedConversions * 0.6);
    const adminApprovals = approvedConversions - systemApprovals;
    
    // Calculate total steps and coins
    const avgStepsSmall = 750;
    const avgStepsMedium = 2000;
    const avgStepsLarge = 5000;
    
    const totalSteps = 
      smallConversions * avgStepsSmall + 
      mediumConversions * avgStepsMedium + 
      largeConversions * avgStepsLarge;
    
    const totalCoins = Math.floor(totalSteps / 100);
    
    statPromises.push(ConversionStats.create({
      date,
      totalRequests,
      totalSteps,
      totalCoins,
      smallConversions,
      mediumConversions,
      largeConversions,
      approvedConversions,
      pendingConversions,
      suspectedConversions,
      rejectedConversions,
      systemApprovals,
      adminApprovals
    }));
  }
  
  await Promise.all(statPromises);
  console.log('Seeded conversion stats');
};

// Main seeding function
const seedAll = async () => {
  try {
    await seedUsers();
    await seedConversions();
    await seedDashboardStats();
    await seedUserStats();
    await seedPointStats();
    await seedStepCoinStats();
    await seedConversionStats();
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    mongoose.disconnect();
  }
};

// Run the seeding
seedAll();
