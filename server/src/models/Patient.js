import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    // ABDM & Aadhaar National Digital Health Ecosystem Linkage
    identity: {
      abhaNumber: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
        trim: true, // 14-digit ABHA ID (e.g. 12-3456-7890-1234)
        set: (v) => (v && v.trim() ? v.trim() : undefined),
      },
      abhaAddress: {
        type: String,
        unique: true,
        sparse: true,
        index: true,
        trim: true, // e.g. rahul.sharma@abdm
        set: (v) => (v && v.trim() ? v.trim().toLowerCase() : undefined),
      },
      isAbhaVerified: {
        type: Boolean,
        default: false,
      },
      aadhaarLastFour: {
        type: String,
        trim: true, // Last 4 digits of Aadhaar
        set: (v) => (v && v.trim() ? v.trim() : undefined),
      },
      aadhaarRefToken: {
        type: String, // UIDAI e-KYC reference / verification token
      },
    },

    // Patient Demographics
    demographics: {
      fullName: {
        type: String,
        required: [true, "Patient full name is required"],
        trim: true,
      },
      gender: {
        type: String,
        enum: ["male", "female", "other", "prefer_not_to_say"],
        required: [true, "Gender is required"],
      },
      dateOfBirth: {
        type: Date,
      },
      age: {
        type: Number,
        required: [true, "Age is required"],
        min: 0,
        max: 130,
      },
      address: {
        villageOrCity: String,
        district: String,
        state: String,
        pincode: String,
      },
      emergencyContact: {
        name: String,
        relationship: String,
        phone: String,
      },
    },

    // Multilingual & Accessibility Settings for Low-Literacy / Elderly Patients
    preferences: {
      preferredLanguage: {
        type: String,
        enum: ["en", "hi", "gu", "kn", "ml", "mr", "ta", "te", "or", "as", "pa"],
        default: "en",
      },
      accessibilityMode: {
        audioGuided: { type: Boolean, default: true },
        highContrast: { type: Boolean, default: false },
        largeFont: { type: Boolean, default: false },
        signLanguageAvatar: { type: Boolean, default: false },
      },
    },

    medicalProfile: {
      heightCm: String,
      weightKg: String,
      bloodGroup: String,
      chronicConditions: { type: [String], default: [] },
      allergies: { type: [String], default: [] },
      medications: { type: [String], default: [] },
    },

    consent: {
      accepted: { type: Boolean, required: true },
      acceptedAt: { type: Date },
    },

    // Patient Medical History Bundles
    bundles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MedicalHistoryBundle",
      },
    ],

    status: {
      type: String,
      enum: ["active", "inactive", "deceased"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

export const Patient = mongoose.model("Patient", patientSchema);
