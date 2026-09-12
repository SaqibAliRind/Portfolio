import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Skill category is required'],
      trim: true,
      enum: {
        values: ['Frontend', 'Backend', 'Database', 'Programming', 'Tools', 'Deployment', 'Other'],
        message: '{VALUE} is not a supported skill category',
      },
    },
    subCategory: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
    },
    level: {
      type: String,
      trim: true,
      enum: {
        values: ['Beginner', 'Intermediate', 'Advanced', ''],
        message: '{VALUE} is not a valid skill level',
      },
      default: '',
    },
    color: {
      type: String,
      trim: true,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    order: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

skillSchema.index({ category: 1, isActive: 1 });
skillSchema.index({ order: 1 });

const Skill = mongoose.model('Skill', skillSchema);

export default Skill;
