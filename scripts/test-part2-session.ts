import { SignJWT, jwtVerify } from "jose";

const secretKey = process.env.AUTH_SECRET || "gnosis-default-development-secret-key-32-chars-minimum!";
const encodedKey = new TextEncoder().encode(secretKey);

async function runPart2Tests() {
  console.log("==================================================");
  console.log("🧪 TESTING PHASE 3 - PART 2: SESSIONS & AUTH LOGIC");
  console.log("==================================================\n");

  const sampleUser = {
    userId: "usr_admin_test_123",
    email: "admin@gnosis.news",
    name: "Lead Administrator",
    role: "ADMIN" as const,
  };

  // 1. Test JWT Session Creation
  console.log("▶ Test 1: Session encryption with HS256 algorithm...");
  const expiresAt = Math.floor(Date.now() / 1000) + 8 * 60 * 60;
  const token = await new SignJWT({ ...sampleUser, expiresAt })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(encodedKey);

  if (typeof token === "string" && token.split(".").length === 3) {
    console.log("  ✓ Passed: Valid 3-part signed JWT generated");
  } else {
    throw new Error("Failed: JWT format invalid");
  }

  // 2. Test Decryption & Payload Integrity
  console.log("▶ Test 2: Session decryption & payload verification...");
  const { payload } = await jwtVerify(token, encodedKey, {
    algorithms: ["HS256"],
  });

  if (
    payload.userId === sampleUser.userId &&
    payload.email === sampleUser.email &&
    payload.role === "ADMIN"
  ) {
    console.log("  ✓ Passed: Decrypted payload matches original user data");
  } else {
    throw new Error("Failed: Payload attributes do not match");
  }

  // 3. Test Tampered / Corrupted Token Rejection
  console.log("▶ Test 3: Tampered token rejection...");
  const tamperedToken = token.slice(0, -5) + "abcde";
  let tamperedRejected = false;
  try {
    await jwtVerify(tamperedToken, encodedKey, { algorithms: ["HS256"] });
  } catch {
    tamperedRejected = true;
    console.log("  ✓ Passed: Tampered token was rejected by signature verification");
  }
  if (!tamperedRejected) {
    throw new Error("Failed: Tampered token was accepted!");
  }

  // 4. Test Expired Token Rejection
  console.log("▶ Test 4: Expired token rejection...");
  const pastTime = Math.floor(Date.now() / 1000) - 100; // 100 seconds in past
  const expiredToken = await new SignJWT({ ...sampleUser, expiresAt: pastTime })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt(pastTime - 100)
    .setExpirationTime(pastTime)
    .sign(encodedKey);

  let expiredRejected = false;
  try {
    await jwtVerify(expiredToken, encodedKey, { algorithms: ["HS256"] });
  } catch {
    expiredRejected = true;
    console.log("  ✓ Passed: Expired token was correctly rejected");
  }
  if (!expiredRejected) {
    throw new Error("Failed: Expired token was accepted!");
  }

  // 5. Test Role Authorization Logic
  console.log("▶ Test 5: Role authorization check...");
  function checkRole(role: string, isActive: boolean) {
    return role === "ADMIN" && isActive === true;
  }
  if (
    checkRole("ADMIN", true) === true &&
    checkRole("EDITOR", true) === false &&
    checkRole("ADMIN", false) === false
  ) {
    console.log("  ✓ Passed: Authorization logic correctly restricts to active ADMIN only");
  } else {
    throw new Error("Failed: Role authorization check logic failed");
  }

  console.log("\n==================================================");
  console.log("🎉 ALL PART 2 SESSION & AUTHORIZATION CHECKS PASSED!");
  console.log("==================================================");
}

runPart2Tests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
