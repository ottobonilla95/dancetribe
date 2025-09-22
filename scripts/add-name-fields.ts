import mongoose from 'mongoose';
import User from '../models/User';
import connectMongo from '../libs/mongoose';

async function addNameFieldsToUsers() {
  try {
    // Connect to MongoDB
    await connectMongo();
    console.log('Connected to MongoDB');

    // Find ALL users and show their current state
    const allUsers = await User.find({}).select('name firstName lastName onboardingSteps');
    console.log(`Total users in database: ${allUsers.length}`);
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name}: firstName="${user.firstName || 'missing'}", lastName="${user.lastName || 'missing'}"`);
    });

    // Find users that don't have firstName or lastName fields
    const usersToUpdate = await User.find({
      $or: [
        { firstName: { $exists: false } },
        { lastName: { $exists: false } },
        { firstName: null },
        { lastName: null }
      ]
    });

    console.log(`\nFound ${usersToUpdate.length} users that need firstName/lastName fields`);

    if (usersToUpdate.length === 0) {
      console.log('All users already have firstName and lastName fields');
      return;
    }

    // Add firstName and lastName fields to all users with empty strings
    const result = await User.updateMany(
      {
        $or: [
          { firstName: { $exists: false } },
          { lastName: { $exists: false } },
          { firstName: null },
          { lastName: null }
        ]
      },
      {
        $set: {
          firstName: "",
          lastName: "",
          'onboardingSteps.nameDetails': false
        }
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} users with firstName and lastName fields`);

    // Show updated users
    const updatedUsers = await User.find({
      firstName: "",
      lastName: ""
    }).select('name firstName lastName onboardingSteps.nameDetails').limit(5);

    console.log('\nUpdated users:');
    updatedUsers.forEach(user => {
      console.log(`- ${user.name}: firstName="${user.firstName}", lastName="${user.lastName}", nameDetails=${user.onboardingSteps?.nameDetails}`);
    });

  } catch (error) {
    console.error('Error adding name fields to users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run the migration
addNameFieldsToUsers(); 