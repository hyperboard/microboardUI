declare module "*.css" {
  const content: unknown;
  export default content;
}

declare module "*.module.css" {
  interface IClassNames {
    [className: string]: string;
  }
  const classNames: IClassNames;
  export = classNames;
}

declare module "*.png" {
  const content: unknown;
  export default content;
}

declare module "*.svg" {
  const content: unknown;
  export default content;
}
