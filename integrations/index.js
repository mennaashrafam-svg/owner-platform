import { facebookAdapter } from "./facebookAdapter.js";
import { googleAdapter } from "./googleAdapter.js";
import { instagramAdapter } from "./instagramAdapter.js";
import { snapchatAdapter } from "./snapchatAdapter.js";
import { tiktokAdapter } from "./tiktokAdapter.js";
import { whatsappAdapter } from "./whatsappAdapter.js";
import { confirmedRevenueAdapters } from "./revenueAdapters.js";

export const platformAdapters = {
  facebook: facebookAdapter,
  instagram: instagramAdapter,
  tiktok: tiktokAdapter,
  google: googleAdapter,
  whatsapp: whatsappAdapter,
  snapchat: snapchatAdapter,
};

export const revenueAdapters = confirmedRevenueAdapters;
