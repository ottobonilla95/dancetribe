import mongoose from "mongoose";
import toJSON from "./plugins/toJSON";

// USER SCHEMA
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    // Unique username for short URLs (e.g., @sarah_dancer)
    username: {
      type: String,
      unique: true,
      sparse: true, // allows null values but enforces uniqueness when present
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores'],
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      private: true,
    },
    image: {
      type: String,
    },
    // Used in the Stripe webhook to identify the user in Stripe and later create Customer Portal or prefill user credit card details
    customerId: {
      type: String,
      validate(value: string) {
        return value.includes("cus_");
      },
    },
    // Used in the Stripe webhook. should match a plan in config.js file.
    priceId: {
      type: String,
      validate(value: string) {
        return value.includes("price_");
      },
    },
    // Used to determine if the user has access to the product—it's turn on/off by the Stripe webhook
    hasAccess: {
      type: Boolean,
      default: false,
    },
    // User's city - links to City collection
    city: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
    },
    // Active city - where user currently is (defaults to home city, can be changed when traveling)
    activeCity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
    },
    // Dance styles the user is interested in/practices with their skill levels
    danceStyles: [{
      danceStyle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DanceStyle",
        required: true
      },
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        required: true
      }
    }],
    // NEW ONBOARDING FIELDS
    // Date of birth
    dateOfBirth: {
      type: Date,
    },
    // Hide age from profile
    hideAge: {
      type: Boolean,
      default: false,
    },
    // User's bio/tagline (150 characters)
    bio: {
      type: String,
      maxlength: 150,
      trim: true,
    },
    // Year when user started dancing
    dancingStartYear: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear(),
    },
    // Cities visited for dance (array of city IDs)
    citiesVisited: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "City",
    }],
    // Upcoming trips - cities user is planning to visit
    trips: [{
      city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "City",
        required: true
      },
      startDate: {
        type: Date,
        required: true
      },
      endDate: {
        type: Date,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    // User's anthem - Spotify or YouTube song
    anthem: {
      url: String,
      platform: {
        type: String,
        enum: ['spotify', 'youtube'],
      },
      title: String,
      artist: String,
    },
    // Social media profiles
    socialMedia: {
      instagram: String,
      tiktok: String,
      youtube: String,
    },
    // Dance role preference
    danceRole: {
      type: String,
      enum: ['follower', 'leader', 'both'],
    },
    // Gender
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    // Nationality (country name)
    nationality: {
      type: String,
      trim: true,
    },
    // Relationship status
    relationshipStatus: {
      type: String,
      enum: ['single', 'in_a_relationship', 'married', 'its_complicated', 'prefer_not_to_say'],
    },
    // Profile completion status
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    // Language preference for UI and emails
    preferredLanguage: {
      type: String,
      enum: ['en', 'es'],
      default: 'en',
    },
    // Onboarding completion tracking
    onboardingSteps: {
      nameDetails: { type: Boolean, default: false },
      danceStyles: { type: Boolean, default: false },
      username: { type: Boolean, default: false },
      profilePic: { type: Boolean, default: false },
      dateOfBirth: { type: Boolean, default: false },
      dancingStartYear: { type: Boolean, default: false },
      currentLocation: { type: Boolean, default: false },
      citiesVisited: { type: Boolean, default: false },
      anthem: { type: Boolean, default: false },
      socialMedia: { type: Boolean, default: false },
      danceRole: { type: Boolean, default: false },
      gender: { type: Boolean, default: false },
      nationality: { type: Boolean, default: false },
      relationshipStatus: { type: Boolean, default: false },
      teacherInfo: { type: Boolean, default: false },
    },
    // Professional roles
    isTeacher: {
      type: Boolean,
      default: false,
    },
    isDJ: {
      type: Boolean,
      default: false,
    },
    isPhotographer: {
      type: Boolean,
      default: false,
    },
    // Teacher profile
    teacherProfile: {
      bio: String,
      yearsOfExperience: Number,
      danceStylesTaught: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "DanceStyle",
      }],
    },
    // DJ profile
    djProfile: {
      djName: String,
      genres: String, // Comma-separated or free text
      bio: String,
    },
    // Photographer profile
    photographerProfile: {
      portfolioLink: String, // Instagram, website, etc.
      specialties: String, // e.g., "Events, Portraits, Social Dancing"
      bio: String,
    },
    // Shared professional contact (for all professional roles)
    professionalContact: {
      whatsapp: String,
      email: String,
    },
    // Social features
    // Users who liked this profile
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    // Friend connections (confirmed friendships)
    friends: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    // Outgoing friend requests (requests this user sent)
    friendRequestsSent: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      sentAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Incoming friend requests (requests received by this user)
    friendRequestsReceived: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      sentAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Travel & Practice Partner Preferences
    // Willing to meet solo dancers (traveling or visiting)
    openToMeetTravelers: {
      type: Boolean,
      default: false,
    },
    // Looking for practice partners
    lookingForPracticePartners: {
      type: Boolean,
      default: false,
    },
    // Jack & Jill competition achievements
    jackAndJillCompetitions: [{
      eventName: {
        type: String,
        required: true,
        trim: true,
      },
      danceStyle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DanceStyle",
        required: true,
      },
      placement: {
        type: String,
        enum: ['participated', '1st', '2nd', '3rd'],
        required: true,
      },
      year: {
        type: Number,
        required: true,
        min: 1900,
        max: new Date().getFullYear() + 1, // Allow next year for upcoming competitions
      },
      addedAt: {
        type: Date,
        default: Date.now,
      }
    }],
    // Admin tracking: whether user profile has been shared on social media
    sharedOnSocialMedia: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

// Pre-remove middleware to handle totalDancers cleanup when user is deleted
userSchema.pre('deleteOne', { document: true, query: false }, async function() {
  if (this.city) {
    const City = mongoose.model('City');
    await City.findByIdAndUpdate(this.city, { 
      $inc: { totalDancers: -1 } 
    });
  }
});

userSchema.pre('findOneAndDelete', async function() {
  const user = await this.model.findOne(this.getQuery());
  if (user && user.city) {
    const City = mongoose.model('City');
    await City.findByIdAndUpdate(user.city, { 
      $inc: { totalDancers: -1 } 
    });
  }
});

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);

export default mongoose.models.User || mongoose.model("User", userSchema);
