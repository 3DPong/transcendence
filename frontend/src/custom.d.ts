

/** [How to import SVG file with Webpack + Typescript]
 * @link https://stackoverflow.com/questions/44717164/unable-to-import-svg-files-in-typescript
*/

declare module "*.svg" {
    const content: any;
    // const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
    export default content;
}