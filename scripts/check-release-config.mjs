const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
const releaseVersion = process.env.RELEASE_VERSION ?? '';
const rollbackVersion = process.env.ROLLBACK_VERSION ?? '';
const failures = [];

try {
  const url = new URL(siteUrl);
  if (url.protocol !== 'https:') failures.push('NEXT_PUBLIC_SITE_URL must use HTTPS');
  if (/example|localhost|127\.0\.0\.1|your-domain/i.test(url.hostname)) failures.push('NEXT_PUBLIC_SITE_URL must be a real production hostname');
} catch {
  failures.push('NEXT_PUBLIC_SITE_URL must be a valid URL');
}

if (!releaseVersion) failures.push('RELEASE_VERSION is required');
if (!rollbackVersion) failures.push('ROLLBACK_VERSION is required');
if (releaseVersion && rollbackVersion && releaseVersion === rollbackVersion) failures.push('RELEASE_VERSION and ROLLBACK_VERSION must differ');

if (failures.length > 0) {
  console.error('Release configuration gate failed.');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Release configuration gate passed (${releaseVersion}; rollback ${rollbackVersion}).`);
