/**
 * Saints section sidebar navigation. Used by all saints subpages.
 * Matches legacy mosc.in/saints structure: 7 saints + overview.
 */
export const SAINTS_SIDEBAR_LINKS = [
  { href: '/syro/saints', label: 'Saints Overview' },
  { href: '/syro/saints/st-mary-mother-of-god', label: 'St. Mary Mother of God' },
  { href: '/syro/saints/the-apostles', label: 'The Apostles' },
  { href: '/syro/saints/early-church-father', label: 'Early Church Fathers' },
  { href: '/syro/saints/st-baselios-yeldho-kothamangalam-bava', label: 'St. Baselios Yeldho (Kothamangalam Bava)' },
  { href: '/syro/saints/st-gregorios-of-parumala-metropolitan-geevarghese-mar-gregorios', label: 'St. Gregorios Of Parumala – Metropolitan Geevarghese Mar Gregorios' },
  { href: '/syro/saints/st-geevarghese-mar-dionysius-vattasseril', label: 'St. Geevarghese Mar Dionysius Vattasseril' },
  { href: '/syro/saints/other-saints-and-martyrs', label: 'Other Saints and Martyrs' },
] as const;
