import Image from "next/image";
import { wedding } from "@/config/wedding";

type WaxSealProps = {
  className?: string;
  /** Set true on the one persistent instance so #s22-wax-seal links resolve. */
  anchor?: boolean;
};

/**
 * The couple's eland crest wax seal — the Set 22 "Eland Crest Seal" artwork
 * from the wedding stationery suite, shared with the traditional-wedding
 * site (where it is also the favicon).
 */
export default function WaxSeal({ className = "", anchor = false }: WaxSealProps) {
  return (
    <Image
      id={anchor ? "s22-wax-seal" : undefined}
      src="/images/eland-seal.png"
      alt={`${wedding.couple.names} eland crest wax seal`}
      width={400}
      height={400}
      priority
      className={className}
    />
  );
}
