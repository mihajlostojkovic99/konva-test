import Image from "next/image";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Conva from "../components/conva";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [showChild, setShowChild] = useState(false);

  useEffect(() => {
    setShowChild(true);
  }, []);

  if (!showChild) {
    return null;
  }

  return (
    <main>
      <Conva></Conva>
    </main>
  );
}
