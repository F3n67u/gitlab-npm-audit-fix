export default function splitPackageName(packageName: string) {
  const [location, name] = packageName.split(':', 2);
  if (name && location) {
    return {
      name,
      fullName: packageName,
      location: name === location ? null : location,
    };
  }
  throw new TypeError(`invalid package: "${packageName}"`);
}
