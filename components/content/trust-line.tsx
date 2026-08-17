import Link from 'next/link';

type FactStatus = 'verified' | 'review_due' | 'disputed' | 'unverified';
type LinkStatus = 'available' | 'degraded' | 'unavailable' | 'unverified';

const factLabels: Record<FactStatus, string> = {
  verified: '事实已登记',
  review_due: '事实待复核',
  disputed: '事实有争议',
  unverified: '事实待核验',
};

const linkLabels: Record<LinkStatus, string> = {
  available: '入口可用',
  degraded: '入口降级',
  unavailable: '入口不可用',
  unverified: '入口未探测',
};

export function TrustLine({ label, href, factStatus, linkStatus, evidenceLabel }: { label: string; href?: string; factStatus?: FactStatus; linkStatus?: LinkStatus; evidenceLabel?: string }) {
  return <div className="trust-line" aria-label={`${label}${factStatus ? `，${factLabels[factStatus]}` : ''}${linkStatus ? `，${linkLabels[linkStatus]}` : ''}`}>
    <span className="trust-line-label">{label}</span>
    {factStatus ? <span className={`trust-line-fact trust-status-${factStatus}`}>事实：{factLabels[factStatus]}</span> : null}
    {linkStatus ? <span className={`trust-line-link trust-status-${linkStatus}`}>链接：{linkLabels[linkStatus]}</span> : null}
    {href ? <Link className="trust-line-action" href={href} aria-label={evidenceLabel ? `查看来源：${evidenceLabel}` : `查看${label}证据`}>查看证据 <span aria-hidden="true">↗</span></Link> : null}
  </div>;
}
