import contact from "./site-contact.json";

export const SITE_HOTLINE = contact.hotline;
export const SITE_HOTLINE_TEL = `tel:${SITE_HOTLINE}`;
export const SITE_HOTLINE_LABEL = `Gọi ${SITE_HOTLINE}`;
export const SITE_ZALO_URL = `https://zalo.me/${SITE_HOTLINE}`;
export const SITE_EMAIL = contact.email;
export const SITE_EMAIL_HREF = `mailto:${SITE_EMAIL}`;
