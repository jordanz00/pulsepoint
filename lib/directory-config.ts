/**
 * Member directory configuration — public/private field visibility.
 */

export type DirectoryField = "name" | "email" | "phone" | "credentials" | "chapter" | "tags";

export type DirectoryConfig = {
  visibility: "public" | "members_only" | "private";
  fields: DirectoryField[];
  searchable: DirectoryField[];
  showPhotos: boolean;
};

export const DEFAULT_DIRECTORY_CONFIG: DirectoryConfig = {
  visibility: "members_only",
  fields: ["name", "email", "credentials", "chapter"],
  searchable: ["name", "email"],
  showPhotos: false,
};

export function parseDirectoryConfig(raw: unknown): DirectoryConfig {
  if (!raw || typeof raw !== "object") return DEFAULT_DIRECTORY_CONFIG;
  const o = raw as Partial<DirectoryConfig>;
  return {
    visibility: o.visibility ?? DEFAULT_DIRECTORY_CONFIG.visibility,
    fields: o.fields ?? DEFAULT_DIRECTORY_CONFIG.fields,
    searchable: o.searchable ?? DEFAULT_DIRECTORY_CONFIG.searchable,
    showPhotos: o.showPhotos ?? false,
  };
}
