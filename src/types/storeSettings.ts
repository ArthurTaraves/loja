export type HeaderMode = 'default' | 'image';

export interface StoreIdentity {
  storeName: string;
  slogan: string;
  logoUrl: string;
  logoPublicId: string;
  faviconUrl: string;
  faviconPublicId: string;
}

export interface StoreColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
}

export interface StoreHeader {
  mode: HeaderMode;
  imageUrl: string;
  imagePublicId: string;
  imageMobileUrl: string;
  imageMobilePublicId: string;
}

export interface StoreWhatsapp {
  phone: string;
  defaultMessage: string;
  orderMessageTemplate: string;
}

export interface StoreSocial {
  instagram?: string;
  tiktok?: string;
  facebook?: string;
}

export interface StoreFooter {
  text: string;
  address: string;
  hours: string;
}

export interface StoreSeo {
  title: string;
  description: string;
}

export interface StoreSettings {
  identity: StoreIdentity;
  colors: StoreColors;
  header: StoreHeader;
  whatsapp: StoreWhatsapp;
  social: StoreSocial;
  footer: StoreFooter;
  seo: StoreSeo;
  updatedAt?: number;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  identity: {
    storeName: 'Minha Loja',
    slogan: 'Os melhores produtos para você',
    logoUrl: '',
    logoPublicId: '',
    faviconUrl: '',
    faviconPublicId: '',
  },
  colors: {
    primary: '#111827',
    secondary: '#6b7280',
    background: '#ffffff',
    text: '#111827',
  },
  header: {
    mode: 'default',
    imageUrl: '',
    imagePublicId: '',
    imageMobileUrl: '',
    imageMobilePublicId: '',
  },
  whatsapp: {
    phone: '',
    defaultMessage: 'Olá! Vim pelo site e gostaria de mais informações.',
    orderMessageTemplate:
      'Olá, meu nome é {nome}!\nGostaria de fazer o seguinte pedido:\n\n{itens}\n\nTotal: {total}\n\nEndereço: {endereco}',
  },
  social: {},
  footer: {
    text: '',
    address: '',
    hours: '',
  },
  seo: {
    title: 'Minha Loja',
    description: 'Os melhores produtos para você',
  },
};
