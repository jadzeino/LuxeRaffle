import { defaultCurrency, defaultLocale } from '@/lib/i18n';

export const formatCurrency = (
  amount: number,
  {
    locale = defaultLocale,
    currency = defaultCurrency,
  }: { locale?: string; currency?: string } = {},
) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

export const formatNumber = (
  amount: number,
  { locale = defaultLocale }: { locale?: string } = {},
) => new Intl.NumberFormat(locale).format(amount);
