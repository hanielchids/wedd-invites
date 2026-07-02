import EnvelopeGate from "@/components/EnvelopeGate";
import Cover from "@/components/Cover";
import StickyHeader from "@/components/StickyHeader";
import FamilyCrest from "@/components/FamilyCrest";
import Invitation from "@/components/Invitation";
import OurPath from "@/components/OurPath";
import Venue from "@/components/Venue";
import Countdown from "@/components/Countdown";
import RSVPForm from "@/components/RSVPForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <EnvelopeGate />
      <StickyHeader />
      <main>
        <Cover />
        <FamilyCrest />
        <Invitation />
        <OurPath />
        <Venue />
        <Countdown />
        <RSVPForm />
      </main>
      <Footer />
    </>
  );
}
