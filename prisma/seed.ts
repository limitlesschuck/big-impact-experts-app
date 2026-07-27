import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create super admin user
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme-set-ADMIN_PASSWORD-in-secrets";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: "community@eventaffiliates.com" },
    update: { password: passwordHash },
    create: {
      email: "community@eventaffiliates.com",
      name: "Admin",
      password: passwordHash,
      role: "super_admin",
    },
  });

  console.log("Created admin user:", admin.email);

  const defaultHost = {
    name: "Chuck Anderson",
    title: "Affiliate Management Expert",
    headshotUrl: "https://d1yei2z3i6k35z.cloudfront.net/2470798/6660fde3403e9_ChuckAnderson.png",
    photoUrl: "https://d1yei2z3i6k35z.cloudfront.net/2470798/660c6f65aec2e_Chuck-400x700.png",
  };

  const existingSiteConfig = await prisma.siteConfig.findFirst();
  if (!existingSiteConfig) {
    await prisma.siteConfig.create({
      data: {
        config: {
          episodeCardImage: "youtube_thumbnail",
          episodeGuideEnabled: true,
          defaultHost,
        },
      },
    });
    console.log("Seeded site config");
  } else {
    const cfg = existingSiteConfig.config as Record<string, unknown>;
    await prisma.siteConfig.update({
      where: { id: existingSiteConfig.id },
      data: {
        config: {
          ...cfg,
          episodeGuideEnabled: true,
          defaultHost,
        },
      },
    });
    console.log("Updated site config");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
