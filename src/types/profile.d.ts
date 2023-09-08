export type Image =
  | {
      src: string;
    }
  | null
  | undefined;

export type ImageV2 = {
  src: string;
} | null;

export interface ProfileSimplified {
  description: string | null;
  image: Image;
}
