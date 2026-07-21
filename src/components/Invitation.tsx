import Image from "next/image";
import { wedding } from "@/config/wedding";
import Reveal from "./Reveal";
import Botanical from "./Botanical";

/** Editorial invitation block — asymmetric photo + words of welcome. */
export default function Invitation() {
  const { invitation, couple } = wedding;

  return (
    <section className="bg-ivory px-5 py-24 sm:py-32">
      <div className="mx-auto grid max-w-content items-center gap-14 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal className="relative order-2 mx-auto w-full max-w-xs lg:order-1">
          <div className="arch-echo" />
          <div className="arch relative aspect-[3/4]">
            <Image
              src="/images/couple-2.jpg"
              alt={`${couple.partnerA.firstName} and ${couple.partnerB.firstName}`}
              fill
              sizes="(min-width: 1024px) 20rem, 80vw"
              className="object-cover"
            />
          </div>
        </Reveal>

        <div className="order-1 text-center lg:order-2 lg:text-left">
          <Reveal>
            <p className="eyebrow">{invitation.eyebrow}</p>
            <div className="hairline lg:mx-0" />
            <h2 className="display-md mt-6">{invitation.heading}</h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="measure mt-7 lg:mx-0">{invitation.body}</p>
          </Reveal>
          <Reveal delay={300}>
            <Botanical className="mt-10 lg:mx-0" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
