import mongoose from 'mongoose';

const LeaderboardSnapshotSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  category: {
    type: String,
    enum: [
      'mostLiked',
      'jjChampions',
      'jjPodium',
      'jjParticipation',
      'mostLikedTeachers',
      'mostLikedDJs',
      'mostLikedPhotographers'
    ],
    required: true,
    index: true
  },
  rankings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rank: {
      type: Number,
      required: true
    },
    score: {
      type: Number,
      required: true
    }
  }]
}, {
  timestamps: true
});

// Compound index for fast queries
LeaderboardSnapshotSchema.index({ category: 1, date: -1 });

export default mongoose.models.LeaderboardSnapshot || mongoose.model('LeaderboardSnapshot', LeaderboardSnapshotSchema);

