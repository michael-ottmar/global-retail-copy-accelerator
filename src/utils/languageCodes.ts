export interface LanguageOption {
  code: string;
  name: string;
  flag: string;
  region: string;
}

export const standardLanguages: LanguageOption[] = [
  // Americas
  { code: 'en-US', name: 'English', region: 'United States', flag: '🇺🇸' },
  { code: 'en-CA', name: 'English', region: 'Canada', flag: '🇨🇦' },
  { code: 'fr-CA', name: 'French', region: 'Canada', flag: '🇨🇦' },
  { code: 'es-MX', name: 'Spanish', region: 'Mexico', flag: '🇲🇽' },
  { code: 'pt-BR', name: 'Portuguese', region: 'Brazil', flag: '🇧🇷' },
  { code: 'es-AR', name: 'Spanish', region: 'Argentina', flag: '🇦🇷' },
  { code: 'es-CO', name: 'Spanish', region: 'Colombia', flag: '🇨🇴' },
  { code: 'es-CL', name: 'Spanish', region: 'Chile', flag: '🇨🇱' },
  { code: 'es-PE', name: 'Spanish', region: 'Peru', flag: '🇵🇪' },
  
  // Europe
  { code: 'en-GB', name: 'English', region: 'United Kingdom', flag: '🇬🇧' },
  { code: 'en-IE', name: 'English', region: 'Ireland', flag: '🇮🇪' },
  { code: 'fr-FR', name: 'French', region: 'France', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', region: 'Germany', flag: '🇩🇪' },
  { code: 'de-AT', name: 'German', region: 'Austria', flag: '🇦🇹' },
  { code: 'de-CH', name: 'German', region: 'Switzerland', flag: '🇨🇭' },
  { code: 'fr-CH', name: 'French', region: 'Switzerland', flag: '🇨🇭' },
  { code: 'it-CH', name: 'Italian', region: 'Switzerland', flag: '🇨🇭' },
  { code: 'it-IT', name: 'Italian', region: 'Italy', flag: '🇮🇹' },
  { code: 'es-ES', name: 'Spanish', region: 'Spain', flag: '🇪🇸' },
  { code: 'ca-ES', name: 'Catalan', region: 'Spain', flag: '🇪🇸' },
  { code: 'pt-PT', name: 'Portuguese', region: 'Portugal', flag: '🇵🇹' },
  { code: 'nl-NL', name: 'Dutch', region: 'Netherlands', flag: '🇳🇱' },
  { code: 'nl-BE', name: 'Dutch', region: 'Belgium', flag: '🇧🇪' },
  { code: 'fr-BE', name: 'French', region: 'Belgium', flag: '🇧🇪' },
  { code: 'sv-SE', name: 'Swedish', region: 'Sweden', flag: '🇸🇪' },
  { code: 'nb-NO', name: 'Norwegian', region: 'Norway', flag: '🇳🇴' },
  { code: 'da-DK', name: 'Danish', region: 'Denmark', flag: '🇩🇰' },
  { code: 'fi-FI', name: 'Finnish', region: 'Finland', flag: '🇫🇮' },
  { code: 'pl-PL', name: 'Polish', region: 'Poland', flag: '🇵🇱' },
  { code: 'cs-CZ', name: 'Czech', region: 'Czech Republic', flag: '🇨🇿' },
  { code: 'sk-SK', name: 'Slovak', region: 'Slovakia', flag: '🇸🇰' },
  { code: 'hu-HU', name: 'Hungarian', region: 'Hungary', flag: '🇭🇺' },
  { code: 'ro-RO', name: 'Romanian', region: 'Romania', flag: '🇷🇴' },
  { code: 'bg-BG', name: 'Bulgarian', region: 'Bulgaria', flag: '🇧🇬' },
  { code: 'hr-HR', name: 'Croatian', region: 'Croatia', flag: '🇭🇷' },
  { code: 'sr-RS', name: 'Serbian', region: 'Serbia', flag: '🇷🇸' },
  { code: 'sl-SI', name: 'Slovenian', region: 'Slovenia', flag: '🇸🇮' },
  { code: 'el-GR', name: 'Greek', region: 'Greece', flag: '🇬🇷' },
  { code: 'tr-TR', name: 'Turkish', region: 'Turkey', flag: '🇹🇷' },
  { code: 'ru-RU', name: 'Russian', region: 'Russia', flag: '🇷🇺' },
  { code: 'uk-UA', name: 'Ukrainian', region: 'Ukraine', flag: '🇺🇦' },
  { code: 'et-EE', name: 'Estonian', region: 'Estonia', flag: '🇪🇪' },
  { code: 'lv-LV', name: 'Latvian', region: 'Latvia', flag: '🇱🇻' },
  { code: 'lt-LT', name: 'Lithuanian', region: 'Lithuania', flag: '🇱🇹' },
  
  // Asia-Pacific
  { code: 'zh-CN', name: 'Chinese (Simplified)', region: 'China', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', region: 'Taiwan', flag: '🇹🇼' },
  { code: 'zh-HK', name: 'Chinese (Traditional)', region: 'Hong Kong', flag: '🇭🇰' },
  { code: 'ja-JP', name: 'Japanese', region: 'Japan', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', region: 'South Korea', flag: '🇰🇷' },
  { code: 'hi-IN', name: 'Hindi', region: 'India', flag: '🇮🇳' },
  { code: 'en-IN', name: 'English', region: 'India', flag: '🇮🇳' },
  { code: 'ta-IN', name: 'Tamil', region: 'India', flag: '🇮🇳' },
  { code: 'te-IN', name: 'Telugu', region: 'India', flag: '🇮🇳' },
  { code: 'mr-IN', name: 'Marathi', region: 'India', flag: '🇮🇳' },
  { code: 'bn-IN', name: 'Bengali', region: 'India', flag: '🇮🇳' },
  { code: 'gu-IN', name: 'Gujarati', region: 'India', flag: '🇮🇳' },
  { code: 'kn-IN', name: 'Kannada', region: 'India', flag: '🇮🇳' },
  { code: 'ml-IN', name: 'Malayalam', region: 'India', flag: '🇮🇳' },
  { code: 'pa-IN', name: 'Punjabi', region: 'India', flag: '🇮🇳' },
  { code: 'th-TH', name: 'Thai', region: 'Thailand', flag: '🇹🇭' },
  { code: 'vi-VN', name: 'Vietnamese', region: 'Vietnam', flag: '🇻🇳' },
  { code: 'id-ID', name: 'Indonesian', region: 'Indonesia', flag: '🇮🇩' },
  { code: 'ms-MY', name: 'Malay', region: 'Malaysia', flag: '🇲🇾' },
  { code: 'fil-PH', name: 'Filipino', region: 'Philippines', flag: '🇵🇭' },
  { code: 'en-AU', name: 'English', region: 'Australia', flag: '🇦🇺' },
  { code: 'en-NZ', name: 'English', region: 'New Zealand', flag: '🇳🇿' },
  { code: 'en-SG', name: 'English', region: 'Singapore', flag: '🇸🇬' },
  { code: 'zh-SG', name: 'Chinese (Simplified)', region: 'Singapore', flag: '🇸🇬' },
  
  // Middle East & Africa
  { code: 'ar-SA', name: 'Arabic', region: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'ar-AE', name: 'Arabic', region: 'United Arab Emirates', flag: '🇦🇪' },
  { code: 'ar-EG', name: 'Arabic', region: 'Egypt', flag: '🇪🇬' },
  { code: 'ar-MA', name: 'Arabic', region: 'Morocco', flag: '🇲🇦' },
  { code: 'he-IL', name: 'Hebrew', region: 'Israel', flag: '🇮🇱' },
  { code: 'fa-IR', name: 'Persian', region: 'Iran', flag: '🇮🇷' },
  { code: 'ur-PK', name: 'Urdu', region: 'Pakistan', flag: '🇵🇰' },
  { code: 'en-ZA', name: 'English', region: 'South Africa', flag: '🇿🇦' },
  { code: 'af-ZA', name: 'Afrikaans', region: 'South Africa', flag: '🇿🇦' },
  { code: 'sw-KE', name: 'Swahili', region: 'Kenya', flag: '🇰🇪' },
  { code: 'am-ET', name: 'Amharic', region: 'Ethiopia', flag: '🇪🇹' },
];

// Helper function to get display name
export function getLanguageDisplayName(option: LanguageOption): string {
  return `${option.code} - ${option.flag} ${option.name} (${option.region})`;
}