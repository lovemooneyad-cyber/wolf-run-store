import {useState} from 'react';
import {Footprints} from 'lucide-react';

interface SneakerImageProps {
  src: string;
  alt: string;
  title: string;
  className?: string;
}

export function SneakerImage({src, alt, title, className = ''}: SneakerImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-zinc-900 to-zinc-950 text-zinc-400 p-6 text-center ${className}`}
        role="img"
        aria-label={alt}>
        <Footprints className="w-10 h-10 mb-2 text-[#DC2626]" strokeWidth={1.5} />
        <span className="text-sm font-semibold text-zinc-200 font-display">{title}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
