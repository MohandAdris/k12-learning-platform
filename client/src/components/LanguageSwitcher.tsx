import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages = [
    { code: "en", label: "EN", flag: "🇬🇧" },
    { code: "ar", label: "ع", flag: "🇸🇦" },
    { code: "he", label: "ע", flag: "🇮🇱" },
  ];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    // RTL direction is automatically handled by RTLProvider
  };

  return (
    <div className="flex items-center gap-1 border rounded-md p-1">
      <Globe className="h-4 w-4 text-muted-foreground mx-1" />
      {languages.map((lang) => (
        <Button
          key={lang.code}
          variant={i18n.language === lang.code ? "default" : "ghost"}
          size="sm"
          onClick={() => changeLanguage(lang.code)}
          className="h-7 px-2 text-xs"
        >
          {lang.flag}
        </Button>
      ))}
    </div>
  );
}

