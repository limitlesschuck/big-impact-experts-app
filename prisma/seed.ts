import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create super admin user
  const adminPassword = process.env.ADMIN_PASSWORD ?? "changeme-set-ADMIN_PASSWORD-in-secrets";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@limitlesslivingshow.com" },
    update: { password: passwordHash },
    create: {
      email: "admin@limitlesslivingshow.com",
      name: "Admin",
      password: passwordHash,
      role: "super_admin",
    },
  });

  console.log("Created admin user:", admin.email);

  // Seed the six crisis category CTAs
  const ctas = [
    {
      crisisCategory: "grief",
      headline: "Struggling with grief or loss?",
      subtext: "You don't have to go through this alone.",
      buttonLabel: "Find your path forward",
    },
    {
      crisisCategory: "relationship",
      headline: "Going through a divorce or relationship crisis?",
      subtext: "Discover what support is available to you.",
      buttonLabel: "Get personalised guidance",
    },
    {
      crisisCategory: "health",
      headline: "Dealing with a health or addiction challenge?",
      subtext: "Hear from others who have been where you are.",
      buttonLabel: "Find the right support",
    },
    {
      crisisCategory: "financial",
      headline: "Facing financial hardship or reinvention?",
      subtext: "Learn what is possible on the other side.",
      buttonLabel: "Explore your options",
    },
    {
      crisisCategory: "spiritual",
      headline: "Going through a spiritual awakening or identity shift?",
      subtext: "You are not alone in this journey.",
      buttonLabel: "Find your direction",
    },
    {
      crisisCategory: "career",
      headline: "Navigating a career change or searching for purpose?",
      subtext: "Real stories from people who made the leap.",
      buttonLabel: "Start your assessment",
    },
  ];

  for (const cta of ctas) {
    await prisma.cta.upsert({
      where: { crisisCategory: cta.crisisCategory },
      update: cta,
      create: { ...cta, assessmentEntry: true },
    });
  }

  console.log("Seeded 6 crisis category CTAs");

  // Seed affiliate routes — BetterHelp for high urgency across all categories
  const categories = ["grief", "relationship", "health", "financial", "spiritual", "career"];
  for (const category of categories) {
    await prisma.affiliateRoute.upsert({
      where: {
        id: `betterhelp-${category}-crisis`,
      },
      update: {},
      create: {
        id: `betterhelp-${category}-crisis`,
        crisisCategory: category,
        urgencyLevel: "crisis",
        affiliateName: "BetterHelp",
        affiliateUrl: "https://www.betterhelp.com",
        priority: 1,
        isActive: true,
        isDefault: false,
      },
    });
    await prisma.affiliateRoute.upsert({
      where: {
        id: `betterhelp-${category}-struggling`,
      },
      update: {},
      create: {
        id: `betterhelp-${category}-struggling`,
        crisisCategory: category,
        urgencyLevel: "struggling",
        affiliateName: "BetterHelp",
        affiliateUrl: "https://www.betterhelp.com",
        priority: 1,
        isActive: true,
      },
    });
  }
  await prisma.affiliateRoute.upsert({
    where: { id: "betterhelp-default" },
    update: {},
    create: {
      id: "betterhelp-default",
      crisisCategory: "any",
      urgencyLevel: "any",
      affiliateName: "BetterHelp",
      affiliateUrl: "https://www.betterhelp.com",
      priority: 99,
      isActive: true,
      isDefault: true,
    },
  });
  console.log("Seeded affiliate routes");

  const existingSiteConfig = await prisma.siteConfig.findFirst();
  if (!existingSiteConfig) {
    await prisma.siteConfig.create({
      data: {
        config: {
          episodeCardImage: "youtube_thumbnail",
          episodeGuideEnabled: true,
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
        },
      },
    });
    console.log("Updated site config");
  }

  const existingConfig = await prisma.assessmentConfig.findFirst();
  if (!existingConfig) {
    await prisma.assessmentConfig.create({
      data: {
        config: {
          questions: [
            {
              id: "category",
              type: "category",
              text: "What best describes what you're going through right now?",
              subtext: "Choose the option that feels closest to your situation.",
              options: [
                { value: "grief", label: "Grief & loss", emoji: "💙", prose: "grief and loss" },
                { value: "relationship", label: "Relationship & divorce", emoji: "💔", prose: "relationship challenges" },
                { value: "health", label: "Health & addiction", emoji: "🌿", prose: "health and addiction" },
                { value: "financial", label: "Financial hardship", emoji: "💪", prose: "financial hardship" },
                { value: "spiritual", label: "Spiritual awakening", emoji: "✨", prose: "spiritual awakening" },
                { value: "career", label: "Career & purpose", emoji: "🎯", prose: "career and purpose" }
              ],
              storeAs: "crisisCategory"
            },
            {
              id: "duration",
              type: "options",
              text: "How long have you been dealing with this?",
              subtext: "This helps us understand where you are in your journey.",
              options: [
                { value: "just_started", label: "Just started — very recent" },
                { value: "few_months", label: "A few months" },
                { value: "over_a_year", label: "Over a year" },
                { value: "long_term", label: "For as long as I can remember" }
              ],
              storeAs: "crisisDuration"
            },
            {
              id: "urgency",
              type: "urgency",
              text: "Where are you right now?",
              subtext: "Be honest — this helps us point you to the right support.",
              options: [
                { value: "crisis", label: "I'm in crisis and need help immediately", score: 10, color: "red" },
                { value: "struggling", label: "I'm struggling and looking for direction", score: 7, color: "amber" },
                { value: "healing", label: "I'm starting to heal but want support", score: 4, color: "blue" },
                { value: "exploring", label: "I'm curious and exploring", score: 2, color: "green" }
              ],
              storeAs: "urgency"
            },
            {
              id: "email",
              type: "email",
              text: "Where should we send your personalised resource guide?",
              subtext: "We'll match you with episodes, resources, and support based on your answers. No spam, ever."
            }
          ],
          thresholds: { coachReferral: 8, resource: 5 },
          results: {
            coach_referral: {
              headline: "You deserve real support right now",
              subtext: "Based on your answers, you're dealing with something significant and would benefit most from working with a specialist coach.",
              ctaLabel: "Connect with a coach →",
              ctaHref: "https://www.betterhelp.com",
              secondaryLabel: "Browse episodes first"
            },
            resource: {
              headline: "You're on the right path — here's what will help",
              subtext: "You're at a stage where the right stories, tools, and resources can make a real difference.",
              ctaLabel: "Browse matching episodes →",
              ctaHref: "/episodes",
              secondaryLabel: "Explore all resources"
            },
            nurture: {
              headline: "Great — you're already thinking ahead",
              subtext: "You're in exploration mode, which is a great place to be.",
              ctaLabel: "Start exploring episodes →",
              ctaHref: "/episodes",
              secondaryLabel: "Browse all episodes"
            }
          }
        }
      }
    });
    console.log("Seeded assessment config");
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
