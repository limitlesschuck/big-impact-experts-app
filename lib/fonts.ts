import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";

// Shared across every public marketing page (Membership, Home, Register,
// Contact) that uses the Bricolage/Jakarta design system established on
// the Membership Sales Page -- one instantiation instead of one per
// page, since next/font instances are per-call-site. The site's global
// font stays Inter (tailwind.config.ts `sans`, set in globals.css); this
// is scoped to whichever pages import it.
export const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Shorthand for the recurring `className={DISPLAY} ...` pattern on
// headings/display text.
export const DISPLAY = bricolage.className;
