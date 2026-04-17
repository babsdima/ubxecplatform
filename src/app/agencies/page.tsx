import Image from "next/image";

export default function AgenciesPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Full-page image */}
      <Image
        src="/zadvoski.png"
        alt="Для executive search агентств"
        fill
        className="object-cover"
        priority
      />

      {/* Overlay comment */}
      <div className="relative z-10 flex items-start justify-center pt-12 px-6">
        <p className="text-white text-4xl font-bold drop-shadow-lg">
          Добро пожаловать
        </p>
      </div>
    </div>
  );
}
