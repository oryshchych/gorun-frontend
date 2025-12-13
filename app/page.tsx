import Image from 'next/image';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Image 
        src="/images/logos/logo.svg" 
        alt="GoRun Events Platform"
        width={200}
        height={67}
        priority
      />
    </div>
  );
}
