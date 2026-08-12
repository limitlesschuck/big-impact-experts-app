import SiteHeader from "@/components/SiteHeader";
import ContactForm from "@/components/ContactForm";
import { jakarta, DISPLAY } from "@/lib/fonts";

export default function ContactPage() {
  return (
    <div className={`${jakarta.className} min-h-screen bg-brand-bg`}>
      <SiteHeader />
      <div className="max-w-xl mx-auto px-6 sm:px-8 py-20 sm:py-24">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-brand-navy/[0.06] px-4 py-2 rounded-full text-[13px] font-bold tracking-wider uppercase text-brand-navy mb-6">
            Get In Touch
          </div>
          <h1 className={`${DISPLAY} text-[clamp(30px,4vw,40px)] font-extrabold tracking-tight text-brand-ink mb-4`}>
            We&rsquo;d Love To Hear From You
          </h1>
          <p className="text-[17px] text-brand-muted leading-relaxed">
            Questions about membership, an event, or anything else — send us a message and
            we&rsquo;ll get back to you directly.
          </p>
        </div>
        <div className="bg-white rounded-[24px] border border-brand-ink/[0.08] p-[clamp(24px,4vw,40px)]">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
