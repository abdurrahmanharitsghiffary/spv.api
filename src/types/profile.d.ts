export type Image = {
  id: number;
  src: string;
};

export interface ProfilePost {
  avatarImage: Image;
}

export interface ProfileSimplified extends ProfilePost {
  profileDescription: string | null;
  avatarImage?: Image;
}
