/**
 * CMS adapter resolver — EasyDNN primary for healthcare association DNN sites.
 */

import {
  buildEasyDnnEventModule,
  buildEasyDnnMemberDirectoryModule,
} from "@/lib/adapters/cms/easydnn-html";
import { getEasyDnnSiteConfig } from "@/lib/adapters/cms/easydnn-store";
import type {
  CmsAdapter,
  EasyDnnExportBundle,
  EasyDnnExportInput,
  MemberDirectoryExportInput,
} from "@/lib/adapters/cms/types";

export const easyDnnCmsAdapter: CmsAdapter = {
  id: "easydnn",

  async isConfigured(orgId: string) {
    const cfg = await getEasyDnnSiteConfig(orgId);
    return Boolean(cfg?.siteUrl);
  },

  buildEventModule(input: EasyDnnExportInput): EasyDnnExportBundle {
    return buildEasyDnnEventModule(input);
  },

  buildMemberDirectoryModule(input: MemberDirectoryExportInput): EasyDnnExportBundle {
    return buildEasyDnnMemberDirectoryModule(input);
  },
};

/** Active CMS adapter — EasyDNN only today; generic-html uses same builder. */
export function getCmsAdapter(): CmsAdapter {
  return easyDnnCmsAdapter;
}

export {
  getEasyDnnConnection,
  getEasyDnnSiteConfig,
  upsertEasyDnnSiteConfig,
} from "@/lib/adapters/cms/easydnn-store";

export type {
  EasyDnnSiteConfig,
  EasyDnnExportBundle,
  EasyDnnExportInput,
  MemberDirectoryExportInput,
} from "@/lib/adapters/cms/types";

/** @deprecated Use getCmsAdapter().buildEventModule — re-export for legacy imports */
export { buildEasyDnnEventModule as buildEasyDnnExport } from "@/lib/adapters/cms/easydnn-html";
