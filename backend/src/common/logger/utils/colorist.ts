import { colours } from './colours';

export function colorist(
  header: string,
  content: string,
  trailer: string,
  options?: {
    headerColor: string;
    contentColor: string;
    trailerColor: string;
  }
): string {
  const headerColor = options ? options.headerColor : colours.fg.yellow;
  const contentColor = options ? options.contentColor : colours.reset;
  const trailerColor = options ? options.trailerColor : colours.fg.yellow;

  return `${headerColor}[${header}]${contentColor} ${content}${trailerColor} ${trailer}${colours.reset}`;
}
