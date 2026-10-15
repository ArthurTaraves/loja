import { useEffect } from 'react';
import { useStoreSettings } from '../../hooks/useStoreSettings';

function setMetaTag(name: string, content: string) {
  let tag = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export function Seo() {
  const { settings } = useStoreSettings();

  useEffect(() => {
    document.title = settings.seo.title || settings.identity.storeName;
    setMetaTag('description', settings.seo.description);
  }, [settings.seo, settings.identity.storeName]);

  useEffect(() => {
    if (!settings.identity.faviconUrl) return;
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = settings.identity.faviconUrl;
  }, [settings.identity.faviconUrl]);

  return null;
}
