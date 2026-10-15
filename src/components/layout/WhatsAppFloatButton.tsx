import { useStoreSettings } from '../../hooks/useStoreSettings';
import { buildWhatsAppUrl } from '../../utils/whatsapp';

export function WhatsAppFloatButton() {
  const { settings } = useStoreSettings();
  const { phone, defaultMessage } = settings.whatsapp;

  if (!phone) return null;

  return (
    <a
      href={buildWhatsAppUrl(phone, defaultMessage)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
        <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.64-1.03-5.12-2.9-6.99A9.82 9.82 0 0 0 12.04 2Zm0 1.8a8.1 8.1 0 0 1 8.1 8.1c0 4.47-3.64 8.1-8.1 8.1a8.07 8.07 0 0 1-4.12-1.13l-.3-.17-3.12.82.83-3.04-.19-.31a8.07 8.07 0 0 1-1.2-4.27c0-4.47 3.63-8.1 8.1-8.1Zm-3.1 4.42c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.76 2.77 4.37 3.78 2.16.84 2.6.67 3.07.63.47-.04 1.5-.61 1.72-1.2.21-.59.21-1.1.15-1.2-.06-.11-.23-.17-.47-.3-.25-.12-1.5-.74-1.73-.83-.23-.08-.4-.12-.57.13-.17.25-.65.82-.8 1-.15.17-.3.19-.55.06-.25-.12-1.07-.4-2.03-1.26-.75-.67-1.26-1.5-1.4-1.75-.15-.25-.02-.38.11-.5.11-.11.25-.3.37-.44.12-.15.16-.25.24-.42.08-.17.04-.31-.02-.44-.06-.12-.57-1.4-.78-1.9-.2-.5-.41-.43-.57-.44Z" />
      </svg>
    </a>
  );
}
