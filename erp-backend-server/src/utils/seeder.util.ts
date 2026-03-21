import { User } from "@/modules/auth/models/user.model";
import { env } from "@/config/env";
import { logger } from "@/config/logger";
import { ROLES } from "@/constants";

// ---------------------------------------------------------------------------
// seedSuperAdmin
//
// Creates the SuperAdmin user if one does not already exist.
// Idempotent — safe to call on every startup. Uses the credentials from
// env vars (SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, SUPER_ADMIN_NAME).
//
// In production: change the password immediately after first login and
// rotate the env vars to something not committed to version control.
// ---------------------------------------------------------------------------
export async function seedSuperAdmin(): Promise<void> {
  const existing = await User.findOne({ role: ROLES.SUPER_ADMIN });

  if (existing) {
    logger.info(
      { email: existing.email },
      "[Seed] SuperAdmin already exists — skipping seed"
    );
    return;
  }

  await User.create({
    name: env.SUPER_ADMIN_NAME,
    email: env.SUPER_ADMIN_EMAIL,
    password: env.SUPER_ADMIN_PASSWORD, // Hashed by the pre-save hook
    role: ROLES.SUPER_ADMIN,
    companyId: null,
    isActive: true,
  });

  logger.info(
    { email: env.SUPER_ADMIN_EMAIL },
    "[Seed] SuperAdmin created successfully"
  );
}
