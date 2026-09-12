import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    // ── Core ────────────────────────────────────────────────
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Project slug is required'],
      trim: true,
      lowercase: true,
      unique: true,
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
    },
    fullDescription: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },

    // ── Media ───────────────────────────────────────────────
    image: {
      type: String,
      trim: true,
    },
    screenshots: {
      type: [String],
      default: [],
    },

    // ── Tech Stack ──────────────────────────────────────────
    technologies: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // ── Project Details ──────────────────────────────────────
    features: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    role: {
      type: String,
      trim: true,
    },
    duration: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      trim: true,
      enum: {
        values: ['completed', 'in-progress', 'planned', 'archived', ''],
        message: '{VALUE} is not a valid project status',
      },
      default: '',
    },

    // ── Links ────────────────────────────────────────────────
    liveDemo: {
      type: String,
      trim: true,
    },
    github: {
      type: String,
      trim: true,
    },

    // ── Detailed Case Study ──────────────────────────────────
    problem: {
      type: String,
      trim: true,
    },
    solution: {
      type: String,
      trim: true,
    },
    targetUsers: {
      type: [String],
      default: [],
    },
    architecture: {
      type: String,
      trim: true,
    },
    databaseDesign: {
      type: String,
      trim: true,
    },
    apiDetails: {
      type: [String],
      default: [],
    },
    challenges: {
      type: [String],
      default: [],
    },
    solutions: {
      type: [String],
      default: [],
    },
    futureImprovements: {
      type: [String],
      default: [],
    },

    // ── Display / Admin ──────────────────────────────────────
    featured: {
      type: Boolean,
      default: false,
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

// Indexes (slug index is created automatically via unique:true in schema definition)
projectSchema.index({ featured: 1, isActive: 1 });
projectSchema.index({ order: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
