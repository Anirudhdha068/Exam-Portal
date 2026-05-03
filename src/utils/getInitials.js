export function getInitials(fullName) {
  if (!fullName || fullName.trim() === '') return 'S';
  return fullName.trim()[0].toUpperCase();
}
