export const getInitials = (name) => {
  if (!name) return "";
  return name
    .split(" ")
    .map((word) => word[0].toUpperCase())
    .join("");
};

export const capitalize = (str) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const toTitleCase = (str) => {
  return str.replace(
    /\w\S*/g,
    (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
};

export const toCamelCase = (str) => {
  return str
    .replace(/[-_ ]+(.)/g, (match, c) => c.toUpperCase())
    .replace(/^(.)/, (match, c) => c.toLowerCase());
};

export const toPascalCase = (str) => {
  return str
    .replace(/[-_ ]+(.)/g, (match, c) => c.toUpperCase())
    .replace(/^(.)/, (match, c) => c.toUpperCase());
};

export const toSnakeCase = (str) => {
  return str
    .replace(/\s+/g, "_")
    .replace(/[A-Z]/g, (letter) => "_" + letter.toLowerCase())
    .replace(/^_/, "")
    .toLowerCase();
};

export const toKebabCase = (str) => {
  return str
    .replace(/\s+/g, "-")
    .replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase())
    .replace(/^-/, "")
    .toLowerCase();
};

export const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
};

export const removeSpaces = (str) => {
  return str.replace(/\s+/g, "");
};

export const truncate = (str, length = 20) => {
  return str.length > length ? str.substring(0, length) + "..." : str;
};

export const wordCount = (str) => {
  return str.trim().split(/\s+/).length;
};

export const removeSpecialChars = (str) => {
  return str.replace(/[^a-zA-Z0-9 ]/g, "");
};

export const randomString = (length = 8) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Clean string - remove extra spaces and trim
export const cleanString = (str) => {
  if (!str) return "";
  return str.trim().replace(/\s+/g, " ");
};

