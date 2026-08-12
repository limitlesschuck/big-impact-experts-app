import SiteHeader from "@/components/SiteHeader";
import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <div className="max-w-xl mx-auto px-6 sm:px-8 py-20 sm:py-24">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-brand-navy mb-4">Get In Touch</h1>
          <p className="text-gray-500">
            Questions about membership, an event, or anything else — send us a message and
            we&rsquo;ll get back to you directly.
          </p>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
