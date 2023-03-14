import { colours } from './colours';

export function colorist(header: string, content: string, trailer: string): string {
  const headerColor = colours.fg.yellow;
  const contentColor = colours.reset;
  const trailerColor = colours.fg.yellow;

  return `${headerColor}[${header}]${contentColor} ${content}${trailerColor} ${trailer}${colours.reset}`;
}
