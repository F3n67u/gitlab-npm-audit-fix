export type Finding = {
  version: string;
};

export type Vulnerability = {
  name: string;
  severity: string;
  via: Array<{ title: string; url: string } | string>;
};

export type AuditReport = Map<
  string,
  { name: string; severity: string; title: string; url: string }
>;

export type FixEntry = {
  name: string;
  version: string;
};

export type FixUpdateEntry = FixEntry & {
  previousVersion: string;
};

export type AuditFix = {
  added: FixEntry[];
  removed: FixEntry[];
  updated: FixUpdateEntry[];
  warnings: string[];
  elapsed: number;
};

export type UrlInfo = {
  name: string;
  url: string;
  type: string;
};

export type PackageInfo = {
  name: string;
  version: string;
  location: string | null;
};

export type PackageInfoWithAudit = PackageInfo & {
  severity: string | null;
  title: string | null;
  url: string | null;
};

export type Report = {
  added: PackageInfo[];
  removed: PackageInfoWithAudit[];
  updated: Array<PackageInfoWithAudit & { previousVersion: string }>;
  packageCount: number;
  packageUrls: Record<string, UrlInfo>;
};

export type Inputs = {
  gitlabToken: string;
  gitlabUser: string;
  gitlabEmail: string;
  branch: string;
  defaultBranch: string;
  commitTitle: string;
  labels: string;
  assignees: string;
  npmArgs: string;
  path: string;
  mergeRequestTemplateFile: string;
  mergeRequestTemplatePlaceholder: string;
};

export type GitLabInfo = {
  serverUrl: string;
  projectPath: string;
  pipelineUrl: string | null;
};

export type GitLabContext = {
  host: string;
  projectPath: string;
  projectId: string | number;
};
