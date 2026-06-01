export function cloudinaryImage(src: string, transform: string) {
  if (!src.includes('res.cloudinary.com') || !src.includes('/image/upload/')) {
    return src;
  }

  return src.replace('/image/upload/', `/image/upload/${transform}/`);
}
