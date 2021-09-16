import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface INewsWebPartProps {
  title: string;
  context: WebPartContext;
  webURL:string;
}
