import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import DanceStyle from '../models/DanceStyle';
import connectMongo from '../libs/mongoose';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

const danceStyles = [
  // Latin styles (mostly partner dances)
  { name: "Salsa", description: "A popular social dance originating from the Caribbean", category: "latin", isPartnerDance: true },
  { name: "Bachata", description: "A romantic dance from the Dominican Republic", category: "latin", isPartnerDance: true },
  { name: "Merengue", description: "A fast-paced dance from the Dominican Republic", category: "latin", isPartnerDance: true },
  { name: "Cumbia", description: "A folk dance and music genre from Colombia", category: "latin", isPartnerDance: true },
  { name: "Cha Cha", description: "A ballroom dance with Cuban origins", category: "latin", isPartnerDance: true },
  { name: "Rumba", description: "A slow, romantic ballroom dance", category: "latin", isPartnerDance: true },
  { name: "Samba", description: "An energetic Brazilian dance", category: "latin", isPartnerDance: false }, // Can be solo or partner
  { name: "Reggaeton", description: "A modern urban dance style", category: "latin", isPartnerDance: false },

  // Ballroom styles (all partner dances)
  { name: "Tango", description: "An elegant and dramatic partner dance from Argentina", category: "ballroom", isPartnerDance: true },
  { name: "Waltz", description: "A smooth, flowing ballroom dance in triple time", category: "ballroom", isPartnerDance: true },
  { name: "Foxtrot", description: "A smooth progressive ballroom dance", category: "ballroom", isPartnerDance: true },

  // Street/Urban styles (mostly solo)
  { name: "Hip Hop", description: "An energetic urban dance style", category: "street", isPartnerDance: false },
  { name: "Breaking", description: "Also known as breakdancing, an athletic street dance", category: "street", isPartnerDance: false },
  { name: "House", description: "A freestyle street dance with fluid movements", category: "street", isPartnerDance: false },

  // Contemporary styles (mostly solo)
  { name: "Contemporary", description: "A modern expressive dance form", category: "contemporary", isPartnerDance: false },
  { name: "Ballet", description: "A classical form of dance with precise movements", category: "contemporary", isPartnerDance: false },
  { name: "Jazz", description: "An energetic dance style with sharp movements", category: "contemporary", isPartnerDance: false },
  { name: "Modern", description: "A free-flowing contemporary dance style", category: "contemporary", isPartnerDance: false },

  // Traditional/Social styles (partner dances)
  { name: "Swing", description: "A lively partner dance from the 1920s-1940s", category: "traditional", isPartnerDance: true },
  { name: "Lindy Hop", description: "An energetic swing dance", category: "traditional", isPartnerDance: true },
  { name: "West Coast Swing", description: "A smooth, slotted swing dance", category: "traditional", isPartnerDance: true },
  
  // African/Afro styles
  { name: "Kizomba", description: "A sensual partner dance from Angola", category: "latin", isPartnerDance: true },
  { name: "Zouk", description: "A partner dance from the French Caribbean", category: "latin", isPartnerDance: true },
  { name: "Afrobeat", description: "An energetic dance style from West Africa", category: "traditional", isPartnerDance: false },
];

async function seedDanceStyles() {
  try {
    console.log('Connecting to MongoDB...');
    await connectMongo();

    console.log('Clearing existing dance styles...');
    await DanceStyle.deleteMany({});

    console.log('Seeding dance styles...');
    await DanceStyle.insertMany(danceStyles);

    console.log(`✅ Successfully seeded ${danceStyles.length} dance styles!`);
    
    // Log the created dance styles
    const createdStyles = await DanceStyle.find({}).sort({ category: 1, name: 1 });
    console.log('\nCreated dance styles:');
    createdStyles.forEach(style => {
      console.log(`- ${style.name} (${style.category})`);
    });

  } catch (error) {
    console.error('❌ Error seeding dance styles:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed.');
    process.exit(0);
  }
}

// Run the seed function
if (require.main === module) {
  seedDanceStyles();
}

export default seedDanceStyles; 