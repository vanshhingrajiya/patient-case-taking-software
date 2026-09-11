import bcrypt from "bcryptjs";
import { randomInt } from "node:crypto";
import { env } from "../../config/env.js";
import { DoctorProfile, OtpVerification, Patient, User, UserPatientProfile } from "../models/index.js";
import { clearAuthCookie, setAuthCookie } from "../utils/authCookie.js";
import { signToken } from "../utils/jwt.js";

function publicPatient(patient) {
  const value = patient.toObject ? patient.toObject() : { ...patient };
  return {
    id: value._id,
    role: "patient",
    fullName: value.demographics?.fullName,
    age: value.demographics?.age,
    gender: value.demographics?.gender,
    preferredLanguage: value.preferences?.preferredLanguage,
    abhaStatus: value.identity?.isAbhaVerified ? "Verified" : "Not verified",
    demographics: value.demographics,
    medicalProfile: value.medicalProfile,
  };
}

function publicProfile(link) {
  const patient = link.patientId;
  if (!patient) return null;
  return {
    id: patient._id,
    fullName: patient.demographics?.fullName,
    age: patient.demographics?.age,
    gender: patient.demographics?.gender,
    preferredLanguage: patient.preferences?.preferredLanguage,
    abhaStatus: patient.identity?.isAbhaVerified ? "Verified" : "Not Verified",
    demographics: patient.demographics,
    medicalProfile: patient.medicalProfile,
    relation: link.relation,
    isPrimary: link.isPrimary,
  };
}

function publicStaff(user) {
  return {
    id: user._id,
    role: user.role,
    fullName: user.name,
    email: user.email,
    department: user.department,
    specialization: user.specialization,
  };
}

export async function registerPatient(req, res) {
  try {
    const {
      abhaNumber, abhaAddress, aadhaarLastFour, fullName, dateOfBirth, gender,
      identifier, mobileNumber, email, preferredLanguage, villageOrCity, district, state,
      pincode, emergencyContactName, emergencyContactRelationship,
      emergencyContactPhone, chronicConditions,
      allergies, medications, consent, otp,
    } = req.body;

    if (!consent) return res.status(400).json({ message: "Consent is required to register." });
    const rawIdentifier = identifier || mobileNumber || email;
    const normalized = normalizeIdentifier(rawIdentifier);
    if (!normalized) return res.status(400).json({ message: "A valid mobile number or email is required." });
    const accountUser = req.auth?.role === "patient" ? await User.findById(req.auth.sub) : null;
    const verification = await consumeOtp(normalized, otp, accountUser ? "profile_add" : "registration");
    if (!verification.ok) return res.status(verification.status).json({ message: verification.message });
    if (!dateOfBirth) return res.status(400).json({ message: "Date of birth is required." });

    const identifierUser = accountUser || await findUser(normalized);
    if (identifierUser && !accountUser) return res.status(409).json({ message: "This mobile number or email is already registered. Please login." });

    const contact = buildAccountContact(normalized, mobileNumber, email);
    if (contact.error) return res.status(400).json({ message: contact.error });
    if (!accountUser) {
      const conflictingUser = await findConflictingUser(contact);
      if (conflictingUser) return res.status(409).json({ message: "The phone number or email is already linked to another account." });
    }

    const cleanAbhaNumber = abhaNumber && String(abhaNumber).trim() ? String(abhaNumber).trim() : undefined;
    const cleanAbhaAddress = abhaAddress && String(abhaAddress).trim() ? String(abhaAddress).trim().toLowerCase() : undefined;
    const cleanAadhaarLastFour = aadhaarLastFour && String(aadhaarLastFour).trim() ? String(aadhaarLastFour).trim() : undefined;

    if (cleanAbhaNumber && (await Patient.exists({ "identity.abhaNumber": cleanAbhaNumber }))) {
      return res.status(409).json({ message: "This ABHA number is already registered." });
    }
    if (cleanAbhaAddress && (await Patient.exists({ "identity.abhaAddress": cleanAbhaAddress }))) {
      return res.status(409).json({ message: "This ABHA address is already registered." });
    }
    if (cleanAadhaarLastFour && (await Patient.exists({ "identity.aadhaarLastFour": cleanAadhaarLastFour }))) {
      return res.status(409).json({ message: "This Aadhaar reference is already registered." });
    }

    const birthDate = new Date(dateOfBirth);
    const age = Math.max(0, Math.floor((Date.now() - birthDate.getTime()) / 31557600000));
    const user = accountUser || (await User.create({ name: fullName, ...contact, role: "patient", isVerified: true }));

    const patientIdentity = {};
    if (cleanAbhaNumber) patientIdentity.abhaNumber = cleanAbhaNumber;
    if (cleanAbhaAddress) patientIdentity.abhaAddress = cleanAbhaAddress;
    if (cleanAadhaarLastFour) patientIdentity.aadhaarLastFour = cleanAadhaarLastFour;

    const patient = await Patient.create({
      identity: patientIdentity,
      demographics: {
        fullName,
        gender,
        dateOfBirth: birthDate,
        age,
        address: { villageOrCity, district, state, pincode },
        emergencyContact: {
          name: emergencyContactName,
          relationship: emergencyContactRelationship,
          phone: emergencyContactPhone,
        },
      },
      preferences: { preferredLanguage },
      medicalProfile: {
        chronicConditions: chronicConditions || [],
        allergies: allergies || [],
        medications: medications || [],
      },
      consent: { accepted: true, acceptedAt: new Date() },
    });

    let relation = "self";
    if (accountUser) {
      const rawRel = String(req.body.emergencyContactRelationship || "").trim().toLowerCase();
      const validRelations = ["child", "spouse", "parent", "sibling", "dependent", "other"];
      relation = validRelations.includes(rawRel) ? rawRel : "dependent";
    }

    const link = await UserPatientProfile.create({
      userId: user.id,
      patientId: patient.id,
      relation,
      isPrimary: !accountUser,
    });
    const token = signToken({ sub: user.id, role: "patient", selectedPatientId: patient.id });
    setAuthCookie(res, token);
    return res.status(201).json(await patientSession(user, patient.id));
  } catch (error) {
    console.error("registerPatient error:", error);
    if (error.code === 11000) {
      const keyPattern = error.keyPattern || {};
      const key = Object.keys(keyPattern)[0] || "";
      if (key.includes("abhaNumber")) return res.status(409).json({ message: "This ABHA number is already registered." });
      if (key.includes("abhaAddress")) return res.status(409).json({ message: "This ABHA address is already registered." });
      if (key.includes("aadhaarLastFour")) return res.status(409).json({ message: "This Aadhaar reference is already registered." });
      if (key.includes("phone")) return res.status(409).json({ message: "This phone number is already registered." });
      if (key.includes("email")) {
        const dupEmail = error.keyValue?.email;
        if (dupEmail) return res.status(409).json({ message: `This email address (${dupEmail}) is already registered.` });
        return res.status(409).json({ message: "A patient account with this identity already exists." });
      }
      return res.status(409).json({ message: "A patient with one of these identity details already exists." });
    }
    return res.status(400).json({ message: error.message || "Unable to register patient." });
  }
}

export async function login(req, res) {
  try {
    const { identifier, password } = req.body;
    const loginValue = normalizeIdentifier(identifier);
    if (!loginValue || !password) return res.status(400).json({ message: "Login identifier and password are required." });

    const user = await findUser(loginValue);
    if (!user || user.role === "patient" || !user.isActive || !(await bcrypt.compare(password, user.passwordHash || ""))) {
      return res.status(401).json({ message: "Invalid login details." });
    }
    user.lastLoginAt = new Date();
    await user.save();
    setAuthCookie(res, signToken({ sub: user.id, role: user.role }));

    let staffData = publicStaff(user);
    if (user.role === "doctor") {
      const doctorProfile = await DoctorProfile.findOne({ userId: user._id });
      if (doctorProfile) {
        staffData = {
          ...staffData,
          department: doctorProfile.department || staffData.department,
          specialization: doctorProfile.specialization || staffData.specialization,
          roomNumber: doctorProfile.roomNumber,
        };
      }
    }
    return res.json({ user: staffData, role: user.role });
  } catch {
    return res.status(500).json({ message: "Unable to sign in right now." });
  }
}

export async function validatePatientRegistration(req, res) {
  try {
    const {
      abhaNumber,
      abhaAddress,
      aadhaarLastFour,
      fullName,
      dateOfBirth,
      gender,
      mobileNumber,
      email,
      preferredLanguage,
      villageOrCity,
      district,
      state,
      pincode,
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactPhone,
      consent,
      isAddingProfile,
    } = req.body;

    const isAdding = Boolean(isAddingProfile || req.auth?.role === "patient");

    const errors = {};

    // 1. Mandatory Identity & Demographics
    if (!fullName || !String(fullName).trim()) {
      errors.fullName = "Full name is required.";
    }

    if (!dateOfBirth) {
      errors.dateOfBirth = "Date of birth is required.";
    } else {
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime())) {
        errors.dateOfBirth = "Enter a valid date of birth.";
      } else if (dob > new Date()) {
        errors.dateOfBirth = "Date of birth cannot be in the future.";
      }
    }

    if (!gender) {
      errors.gender = "Please select a gender.";
    }

    if (preferredLanguage) {
      const allowedLanguages = ["en", "hi","gu", "kn", "ml", "mr", "ta", "te", "or", "as", "pa"];
      if (!allowedLanguages.includes(preferredLanguage)) {
        errors.preferredLanguage = "Please select a supported language.";
      }
    }

    // 2. Mobile validation & uniqueness
    const normMobile = normalizeIdentifier(mobileNumber);
    if (!normMobile) {
      errors.mobileNumber = "Enter a valid 10-digit mobile number.";
    } else if (!isAdding) {
      const existingUser = await User.findOne({ phone: normMobile });
      if (existingUser) {
        errors.mobileNumber = "This mobile number is already registered. Please sign in.";
      }
    }

    // 3. Email validation & uniqueness (optional field)
    if (email && String(email).trim()) {
      const normEmail = String(email).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail)) {
        errors.email = "Enter a valid email address.";
      } else if (!isAdding) {
        const existingUser = await User.findOne({ email: normEmail });
        if (existingUser) {
          errors.email = "This email address is already registered.";
        }
      }
    }

    // 4. Address (all mandatory)
    if (!villageOrCity || !String(villageOrCity).trim()) {
      errors.villageOrCity = "Village or city is required.";
    }

    if (!district || !String(district).trim()) {
      errors.district = "District is required.";
    }

    if (!state || !String(state).trim()) {
      errors.state = "Please select a state.";
    }

    if (!pincode || !/^\d{6}$/.test(String(pincode).trim())) {
      errors.pincode = "Enter a valid 6-digit PIN code.";
    }

    // 5. Emergency Contact (all mandatory)
    if (!emergencyContactName || !String(emergencyContactName).trim()) {
      errors.emergencyContactName = "Emergency contact name is required.";
    }

    if (!emergencyContactRelationship || !String(emergencyContactRelationship).trim()) {
      errors.emergencyContactRelationship = "Please select relationship.";
    }

    const normEmergencyPhone = normalizeIdentifier(emergencyContactPhone);
    if (!normEmergencyPhone) {
      errors.emergencyContactPhone = "Enter a valid 10-digit emergency contact phone.";
    }

    // 6. ABDM / Aadhaar national identity uniqueness
    if (abhaNumber && String(abhaNumber).trim()) {
      const cleanAbha = String(abhaNumber).trim();
      const existingAbha = await Patient.findOne({ "identity.abhaNumber": cleanAbha });
      if (existingAbha) {
        errors.abhaNumber = "This ABHA number is already registered.";
      }
    }

    if (abhaAddress && String(abhaAddress).trim()) {
      const cleanAbhaAddress = String(abhaAddress).trim().toLowerCase();
      const existingAbhaAddress = await Patient.findOne({ "identity.abhaAddress": cleanAbhaAddress });
      if (existingAbhaAddress) {
        errors.abhaAddress = "This ABHA address is already registered.";
      }
    }

    if (aadhaarLastFour && String(aadhaarLastFour).trim()) {
      const lastFour = String(aadhaarLastFour).trim();
      if (!/^\d{4}$/.test(lastFour)) {
        errors.aadhaarLastFour = "Enter exactly 4 digits.";
      } else {
        const existingAadhaar = await Patient.findOne({ "identity.aadhaarLastFour": lastFour });
        if (existingAadhaar) {
          errors.aadhaarLastFour = "This Aadhaar reference is already registered.";
        }
      }
    }

    // 7. ABDM Consent
    if (!consent) {
      errors.consent = "You must agree to ABDM consent to register.";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        message: "Please correct the highlighted fields before proceeding.",
        errors,
      });
    }

    return res.json({ valid: true });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to validate registration details." });
  }
}

export async function requestPatientOtp(req, res) {
  try {
    console.log("Requesting patient OTP for:", req.body.identifier);
    const identifier = normalizeIdentifier(req.body.identifier);
    if (!identifier) return res.status(400).json({ message: "Enter a valid phone number or email address." });

    const user = await findUser(identifier);
    if (user && user.role !== "patient") return res.status(409).json({ message: "This identifier belongs to a staff account. Use staff login." });

    if (req.body.purpose === "registration" && user) {
      return res.status(409).json({
        message: "This mobile number or email is already registered. Please sign in.",
        field: identifier.includes("@") ? "email" : "mobileNumber",
        errors: {
          [identifier.includes("@") ? "email" : "mobileNumber"]:
            "This mobile number or email is already registered. Please sign in.",
        },
      });
    }

    const purpose = req.body.purpose === "profile_add" && user ? "profile_add" : user ? "login" : "registration";

    const code = String(randomInt(100000, 1000000));
    await OtpVerification.create({
      identifier,
      channel: identifier.includes("@") ? "email" : "phone",
      purpose,
      codeHash: await bcrypt.hash(code, 10),
      expiresAt: new Date(Date.now() + env.otpExpiresMinutes * 60 * 1000),
    });
    console.log(`[patient-otp:${purpose}] ${identifier}: ${code}`);
    const response = { message: "OTP generated. Check the backend console during phase 1.", purpose, channel: identifier.includes("@") ? "email" : "phone", requiresRegistration: !user, identifier };
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Unable to generate OTP." });
  }
}

export async function verifyPatientOtp(req, res) {
  try {
    const identifier = normalizeIdentifier(req.body.identifier);
    const verification = await consumeOtp(identifier, req.body.otp, "login");
    if (!verification.ok) return res.status(verification.status).json({ message: verification.message });
    const user = await findUser(identifier);
    if (!user || user.role !== "patient" || !user.isActive) return res.status(404).json({ message: "Patient account not found. Please register." });
    user.lastLoginAt = new Date();
    await user.save();
    setAuthCookie(res, signToken({ sub: user.id, role: "patient" }));
    return res.json(await patientSession(user));
  } catch {
    return res.status(500).json({ message: "Unable to verify OTP." });
  }
}

export async function selectPatientProfile(req, res) {
  if (req.auth.role !== "patient") return res.status(403).json({ message: "Only patient accounts can select a profile." });
  const link = await UserPatientProfile.findOne({ userId: req.auth.sub, patientId: req.body.patientId }).populate("patientId");
  if (!link) return res.status(403).json({ message: "This patient profile is not linked to the account." });
  setAuthCookie(res, signToken({ sub: req.auth.sub, role: "patient", selectedPatientId: link.patientId.id }));
  return res.json({ user: await User.findById(req.auth.sub).then(publicUser), patient: publicPatient(link.patientId), role: "patient", selectedPatientId: link.patientId.id });
}

export async function getCurrentUser(req, res) {
  const record = await User.findById(req.auth.sub);
  if (!record) return res.status(404).json({ message: "Account not found." });
  if (record.role !== "patient") {
    let staffData = publicStaff(record);
    if (record.role === "doctor") {
      const doctorProfile = await DoctorProfile.findOne({ userId: record._id });
      if (doctorProfile) {
        staffData = {
          ...staffData,
          department: doctorProfile.department || staffData.department,
          specialization: doctorProfile.specialization || staffData.specialization,
          roomNumber: doctorProfile.roomNumber,
        };
      }
    }
    return res.json({ user: staffData, role: record.role });
  }
  return res.json(await patientSession(record, req.auth?.selectedPatientId));
}

export function logout(req, res) {
  clearAuthCookie(res);
  return res.json({ message: "Signed out." });
}

export async function updatePreferredLanguage(req, res) {
  try {
    const { preferredLanguage } = req.body;
    const allowed = ["en", "hi", "gu", "kn", "ml", "mr", "ta", "te", "or", "as", "pa"];
    if (!allowed.includes(preferredLanguage)) {
      return res.status(400).json({ message: "Invalid language selection." });
    }

    if (req.auth.role === "patient") {
      let patientId = req.auth.selectedPatientId;
      if (!patientId) {
        const link = await UserPatientProfile.findOne({ userId: req.auth.sub }).sort({ isPrimary: -1, createdAt: 1 });
        patientId = link?.patientId;
      }
      if (patientId) {
        await Patient.findByIdAndUpdate(patientId, { "preferences.preferredLanguage": preferredLanguage });
      }
    }

    return res.json({ success: true, preferredLanguage });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to update language." });
  }
}

function normalizeIdentifier(value) {
  const identifier = String(value || "").trim();
  if (!identifier) return null;
  if (identifier.includes("@")) return identifier.toLowerCase();
  let digits = identifier.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

function findUser(identifier) {
  return User.findOne(identifier.includes("@") ? { email: identifier } : { phone: identifier });
}

function buildAccountContact(identifier, mobileNumber, email) {
  const normMobile = normalizeIdentifier(mobileNumber);
  const normEmail = String(email || "").trim().toLowerCase();
  const phone = identifier.includes("@") ? normMobile : identifier;
  const accountEmail = identifier.includes("@") ? identifier : (normEmail.includes("@") ? normEmail : undefined);
  if (!phone && !accountEmail) return { error: "A valid mobile number or email address is required." };
  if (mobileNumber && !normMobile) return { error: "Enter a valid 10-digit mobile number." };
  if (email && !accountEmail?.includes("@")) return { error: "Enter a valid email address." };
  return { ...(phone ? { phone } : {}), ...(accountEmail ? { email: accountEmail } : {}) };
}

function findConflictingUser(contact) {
  const conditions = [];
  if (contact.phone) conditions.push({ phone: contact.phone });
  if (contact.email) conditions.push({ email: contact.email });
  return conditions.length ? User.findOne({ $or: conditions }) : null;
}

async function consumeOtp(identifier, code, purpose) {
  if (!identifier || !/^\d{6}$/.test(String(code || ""))) return { ok: false, status: 400, message: "Enter the six-digit OTP." };
  const otp = await OtpVerification.findOne({ identifier, purpose, consumedAt: { $exists: false } }).sort({ createdAt: -1 });
  if (!otp || otp.expiresAt <= new Date()) return { ok: false, status: 401, message: "This OTP has expired. Request a new one." };
  if (otp.attempts >= env.otpMaxAttempts) return { ok: false, status: 429, message: "Too many incorrect attempts. Request a new OTP." };
  otp.attempts += 1;
  const valid = await bcrypt.compare(String(code), otp.codeHash);
  if (!valid) {
    await otp.save();
    return { ok: false, status: 401, message: "Incorrect OTP." };
  }
  otp.consumedAt = new Date();
  await otp.save();
  return { ok: true };
}

async function patientSession(user, selectedPatientId) {
  const links = await UserPatientProfile.find({ userId: user.id }).populate("patientId").sort({ isPrimary: -1, createdAt: 1 });
  const activeLink = selectedPatientId ? links.find((l) => String(l.patientId?._id) === String(selectedPatientId)) : links[0];
  const activePatient = activeLink?.patientId || links[0]?.patientId;
  return {
    user: publicUser(user),
    profiles: links.map(publicProfile).filter(Boolean),
    patient: activePatient ? publicPatient(activePatient) : null,
    role: "patient",
  };
}

function publicUser(user) {
  return { id: user.id, fullName: user.name, phone: user.phone, email: user.email, role: user.role };
}
