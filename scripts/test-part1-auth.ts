import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

async function runPart1Tests() {
  console.log("==================================================");
  console.log("🧪 TESTING PHASE 3 - PART 1: USER SCHEMA & HASHING");
  console.log("==================================================\n");

  // 1. Verify UserRole Enum
  console.log("▶ Test 1: UserRole Enum verification...");
  if (UserRole.ADMIN === "ADMIN" && UserRole.EDITOR === "EDITOR") {
    console.log("  ✓ Passed: UserRole enum correctly defines ADMIN and EDITOR");
  } else {
    throw new Error("Failed: UserRole enum does not match expected values.");
  }

  // 2. Test Password Hashing
  console.log("▶ Test 2: Password hashing with bcrypt (12 rounds)...");
  const testPassword = "GnosisSecureAdminPassword2026!";
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(testPassword, salt);

  if (hash.startsWith("$2a$") || hash.startsWith("$2b$")) {
    console.log("  ✓ Passed: Password successfully hashed with bcrypt standard");
  } else {
    throw new Error("Failed: Hash does not match bcrypt format.");
  }

  // 3. Test Password Verification (Valid)
  console.log("▶ Test 3: Password verification (correct password)...");
  const isValid = await bcrypt.compare(testPassword, hash);
  if (isValid === true) {
    console.log("  ✓ Passed: Correct password verified successfully");
  } else {
    throw new Error("Failed: Valid password failed verification.");
  }

  // 4. Test Password Verification (Invalid)
  console.log("▶ Test 4: Password rejection (wrong password)...");
  const isInvalidValid = await bcrypt.compare("WrongPassword123", hash);
  if (isInvalidValid === false) {
    console.log("  ✓ Passed: Incorrect password correctly rejected");
  } else {
    throw new Error("Failed: Incorrect password was accepted.");
  }

  console.log("\n==================================================");
  console.log("🎉 ALL PART 1 AUTH SECURITY CHECKS PASSED!");
  console.log("==================================================");
}

runPart1Tests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
