import Preloader from "@/components/Preloader";
import StickyHeader from "@/components/StickyHeader";
import Hero from "@/components/Hero";
import Countdown from "@/components/Countdown";
import Invitation from "@/components/Invitation";
import Schedule from "@/components/Schedule";
import Venue from "@/components/Venue";
import DressCode from "@/components/DressCode";
import RSVPForm from "@/components/RSVPForm";
import Stay from "@/components/Stay";
import Faq from "@/components/Faq";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Preloader />
      <StickyHeader />
      <main>
        <Hero />
        <Countdown />
        <Invitation />
        <Schedule />
        <Venue />
        <DressCode />
        <RSVPForm />
        <Stay />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
