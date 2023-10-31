export const getFilePathname = (
  profile: { src: string; id?: number } | null | undefined
) => {
  if (!profile) return null;
  try {
    const url = new URL(profile.src, process.env.BASE_WEB_URL);
    return { ...profile, src: url.href };
  } catch (err) {
    return null;
  }
};
