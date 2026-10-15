import { useStoreSettings } from '../../hooks/useStoreSettings';

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-secondary transition-colors hover:text-primary"
    >
      {label}
    </a>
  );
}

export function Footer() {
  const { settings } = useStoreSettings();
  const { footer, social, identity } = settings;
  const hasSocial = social.instagram || social.tiktok || social.facebook;

  return (
    <footer className="border-t border-secondary/20 bg-background px-4 py-8 text-sm text-text sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="font-medium text-primary">{identity.storeName}</p>
          {footer.text && <p className="text-secondary">{footer.text}</p>}
          {footer.address && <p className="text-secondary">{footer.address}</p>}
          {footer.hours && <p className="text-secondary">{footer.hours}</p>}
        </div>

        {hasSocial && (
          <div className="flex gap-4">
            {social.instagram && <SocialLink href={social.instagram} label="Instagram" />}
            {social.tiktok && <SocialLink href={social.tiktok} label="TikTok" />}
            {social.facebook && <SocialLink href={social.facebook} label="Facebook" />}
          </div>
        )}
      </div>
    </footer>
  );
}
