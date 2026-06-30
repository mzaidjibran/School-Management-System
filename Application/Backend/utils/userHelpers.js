// Shared helpers used across auth controllers wherever user data is returned.

// Normalizes a user's image path to always return a clean /image/<filename> URL.
// Handles cases where the stored value is an absolute disk path or already normalized.
export const normalizeUserImage = (image) => {
  if (!image) return "";
  return image.startsWith("/image/")
    ? image
    : `/image/${image.split(/[\\/]/).pop()}`;
};

// Returns a safe user object with the password field removed and image path normalized.
// Accepts a Mongoose document or a plain object.
export const toSafeUser = (user) => {
  if (!user) return null;
  const raw = user.toObject ? user.toObject() : user;
  const { password, ...safeRaw } = raw;
  const normalizedImg = normalizeUserImage(raw.profileImage || raw.image);
  return { ...safeRaw, image: normalizedImg, profileImage: normalizedImg };
};