import { Item } from "microboard-temp";
import type { ItemData } from "microboard-temp";

type ClipboardData =
  | { [key: string]: ItemData }
  | {
      imageElement: HTMLImageElement;
      imageData: { [key: string]: ItemData };
    }
  | ClipboardEvent;

export class Clipboard {
  items: ClipboardData | null = null;

  list(): Item[] {
    throw new Error("Method not implemented.");
  }

  set(data: ClipboardData | null): void {
    this.items = data;
  }

  get(): ClipboardData | null {
    return this.items;
  }
}
