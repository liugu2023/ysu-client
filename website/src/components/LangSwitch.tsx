import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

interface LangSwitchProps {
  currentLang: string;
  switchLabel: string;
  switchUrl: string;
}

export default function LangSwitch({ currentLang, switchLabel, switchUrl }: LangSwitchProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Switch language">
        <Globe className="w-5 h-5" />
      </button>
    );
  }

  return (
    <a
      href={switchUrl}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted transition-colors text-sm"
      aria-label="Switch language"
    >
      <Globe className="w-4 h-4" />
      <span>{switchLabel}</span>
    </a>
  );
}
