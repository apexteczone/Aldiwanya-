import {ASSET_BASE_URL} from '../services/api';
export const errorMessage = e => e.response?.data?.error?.message || 'تعذر إتمام الطلب. حاول مرة أخرى.';
export function assetUrl(value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return value.startsWith('/uploads/') ? ASSET_BASE_URL + value : '';
}
export const price = plan => new Intl.NumberFormat('ar-KW', {style: 'currency', currency: plan.currency || 'KWD'}).format(plan.amountMinor / (plan.currency === 'KWD' ? 1000 : 100));
export const date = value => value ? new Date(value).toLocaleDateString('ar-KW') : '—';
export const activeSubscription = rows => (rows || []).find(s => new Date(s.startsAt) <= new Date() && new Date(s.endsAt) > new Date());
