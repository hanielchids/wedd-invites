import type { Metadata } from "next";
import Photobooth from "@/components/Photobooth";

export const metadata: Metadata = {
  title: "The Wall — Haniel & Zenzi",
  description:
    "Snap a polaroid, share it, and pin it to the wedding photo wall.",
  robots: { index: false, follow: false },
};

export default function PhotoboothPage() {
  return <Photobooth />;
}
