import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema(
  {
    position: {
      type: String,
      required: [true, 'Position/job title is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    type: {
      type: String,
      trim: true,
      enum: {
        values: ['Full-time', 'Part-time', 'Freelance', 'Internship', 'Contract', 'Volunteer', 'Other', ''],
        message: '{VALUE} is not a valid employment type',
      },
      default: '',
    },
    startDate: {
      type: String,
      trim: true,
    },
    endDate: {
      type: String,
      trim: true,
    },
    current: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
    },
    responsibilities: {
      type: [String],
      default: [],
    },
    technologies: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      trim: true,
    },
    link: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Experience = mongoose.model('Experience', experienceSchema);

export default Experience;
