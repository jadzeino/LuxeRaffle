import type { Raffle } from '@/lib/schemas/raffle';
import { defaultCurrency } from '@/lib/i18n';
import { siteDescription, siteName, siteUrl } from '@/lib/site';

export function buildHomeJsonLd(raffles: Raffle[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: siteName,
        url: siteUrl,
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        name: siteName,
        url: siteUrl,
        description: siteDescription,
        publisher: {
          '@id': `${siteUrl}/#organization`,
        },
      },
      {
        '@type': 'ItemList',
        '@id': `${siteUrl}/#live-raffles`,
        name: 'Live luxury car raffles',
        itemListElement: raffles.slice(0, 12).map((raffle, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Product',
            name: raffle.name,
            image: raffle.image,
            description: raffle.description,
            offers: {
              '@type': 'Offer',
              price: raffle.ticketPrice,
              priceCurrency: defaultCurrency,
              availability:
                raffle.availableTickets > 0
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/SoldOut',
            },
          },
        })),
      },
    ],
  };
}
