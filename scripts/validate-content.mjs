import { readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA_FILE = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'site-data.json');
const UPDATES_FILE = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'content', 'updates.json');
const PUBLIC_DIRECTORY = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const COLLECTION_RULES = [
  { key: 'majors', minimum: 2 },
  { key: 'dualLensCases', minimum: 2 },
  { key: 'capabilities', minimum: 8 },
  { key: 'projects', minimum: 3 },
  { key: 'scenarios', minimum: 6 },
  { key: 'faqs', minimum: 3 },
];

const PROJECT_REQUIRED_FIELDS = [
  'sourceUrl',
  'license',
  'dataAccess',
  'durationBands',
  'level',
  'mode',
  'courseEvidence',
  'data',
  'stopCondition',
  'expectedOutput',
  'artifactId',
  'artifactTemplate',
  'reflectionPrompt',
  'validation',
  'nextStep',
  'endpointIds',
  'previewAssets',
  'owner',
  'updatedAt',
  'reviewDueAt',
];

const BANNED_TERMS = [
  '诊断建议',
  '治疗建议',
  '就业保证',
  '排名第一',
  '保证就业',
  '包就业',
  '100%就业',
  '完全治愈',
  '治愈',
  '确诊',
  '处方',
  '零风险',
];

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const URL_PATTERN = /\b(?:https?|ftp):\/\/[^\s"'<>]+/gi;
const URL_FIELD_PATTERN = /(?:url|uri|href)$/i;
const LINK_FIELD_PATTERN = /^(?:external|resource|source|demo|repo|doc|docs|home)?links?$/i;
const RELATION_SUFFIX_PATTERN = /(ids?|slugs?|refs?)$/i;

const errors = [];

function addError(message) {
  errors.push(message);
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function hasValue(value) {
  if (value === undefined || value === null) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (isRecord(value)) {
    return Object.keys(value).length > 0;
  }

  return true;
}

function formatPath(parts) {
  return parts.reduce((result, part) => {
    if (typeof part === 'number') {
      return `${result}[${part}]`;
    }

    return result ? `${result}.${part}` : part;
  }, '');
}

function validDate(value) {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function normalizeName(value) {
  return String(value).replace(/[-_\s]/g, '').toLowerCase();
}

function collectionAliases(key) {
  const normalized = normalizeName(key);
  const singular = normalized.endsWith('s') ? normalized.slice(0, -1) : normalized;

  return new Set([normalized, singular]);
}

function buildCollectionTargets(data) {
  const targets = [];

  for (const [key, value] of Object.entries(data)) {
    if (!Array.isArray(value)) {
      continue;
    }

    const ids = new Set();
    const slugs = new Set();

    for (const item of value) {
      if (!isRecord(item)) {
        continue;
      }

      if (typeof item.id === 'string' && item.id.trim()) {
        ids.add(item.id);
      }

      if (typeof item.slug === 'string' && item.slug.trim()) {
        slugs.add(item.slug);
      }
    }

    targets.push({ key, aliases: collectionAliases(key), ids, slugs });
  }

  return targets;
}

function findRelationTarget(propertyName, targets) {
  const normalizedProperty = normalizeName(propertyName);
  const suffixMatch = normalizedProperty.match(RELATION_SUFFIX_PATTERN);

  if (!suffixMatch) {
    return null;
  }

  const stem = normalizedProperty.slice(0, -suffixMatch[0].length);
  if (!stem) {
    return null;
  }

  for (const target of targets) {
    for (const alias of target.aliases) {
      // `primaryResourceId` is a runtime-resource reference, not a `sources`
      // evidence reference. Avoid the lexical `resource` -> `source` collision.
      if (alias === 'source' && stem.endsWith('resource')) continue;
      if (stem === alias || stem.endsWith(alias)) {
        return target;
      }
    }
  }

  return null;
}

function validateRelationValue(value, path, target) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => validateRelationValue(item, [...path, index], target));
    return;
  }

  if (typeof value === 'string' && value.trim()) {
    if (!target.ids.has(value) && !target.slugs.has(value)) {
      addError(`${formatPath(path)} 引用了不存在的 ${target.key}：${value}`);
    }
    return;
  }

  if (isRecord(value)) {
    const reference = value.id ?? value.slug;

    if (typeof reference === 'string' && reference.trim()) {
      validateRelationValue(reference, path, target);
      return;
    }
  }

  addError(`${formatPath(path)} 关系引用必须是存在的 ${target.key} id/slug`);
}

function validateRelations(value, path, targets) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => validateRelations(item, [...path, index], targets));
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  for (const [propertyName, propertyValue] of Object.entries(value)) {
    const propertyPath = [...path, propertyName];
    const target = findRelationTarget(propertyName, targets);

    if (target) {
      validateRelationValue(propertyValue, propertyPath, target);
    }

    validateRelations(propertyValue, propertyPath, targets);
  }
}

function validateHttpsUrl(value, path) {
  if (typeof value !== 'string' || !value.trim()) {
    addError(`${formatPath(path)} 必须是 HTTPS 外链`);
    return;
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    addError(`${formatPath(path)} 不是有效 URL：${value}`);
    return;
  }

  if (parsed.protocol !== 'https:') {
    addError(`${formatPath(path)} 只允许 https 外链：${value}`);
  }
}

function validateProjectLinks(value, path, linkContext = false) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => validateProjectLinks(item, [...path, index], linkContext));
    return;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    const embeddedUrls = trimmed.match(URL_PATTERN) ?? [];

    if (linkContext) {
      if (trimmed.startsWith('/')) {
        if (!trimmed.startsWith('/project-templates/') && !trimmed.startsWith('/projects/')) {
          addError(`${formatPath(path)} 项目内部链接只能指向项目详情或模板：${trimmed}`);
        }
      } else {
        validateHttpsUrl(trimmed, path);
      }
    } else {
      embeddedUrls.forEach((url) => validateHttpsUrl(url, path));
    }
    return;
  }

  if (!isRecord(value)) {
    return;
  }

  for (const [propertyName, propertyValue] of Object.entries(value)) {
    const propertyPath = [...path, propertyName];
    const isLinkField = URL_FIELD_PATTERN.test(propertyName) || LINK_FIELD_PATTERN.test(propertyName);

    if (isLinkField && typeof propertyValue === 'string' && propertyValue.trim()) {
      const linkValue = propertyValue.trim();
      if (linkValue.startsWith('/')) {
        if (!linkValue.startsWith('/project-templates/') && !linkValue.startsWith('/projects/')) {
          addError(`${formatPath(propertyPath)} 项目内部链接只能指向项目详情或模板：${linkValue}`);
        }
      } else {
        validateHttpsUrl(linkValue, propertyPath);
      }
    } else {
      validateProjectLinks(propertyValue, propertyPath, linkContext || isLinkField);
    }
  }
}

function scanForBannedTerms(value, path) {
  if (typeof value === 'string') {
    for (const term of BANNED_TERMS) {
      let searchStart = 0;
      while (searchStart < value.length) {
        const index = value.indexOf(term, searchStart);
        if (index === -1) break;
        const context = value.slice(Math.max(0, index - 10), index);
        const isNegated = /(?:不|非|不能|不得|禁止|无|未)[^。；;:：]{0,14}$/.test(context);
        if (!isNegated) {
          addError(`${formatPath(path)} 包含禁止的高风险/过度承诺词“${term}”`);
        }
        searchStart = index + term.length;
      }
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => scanForBannedTerms(item, [...path, index]));
    return;
  }

  if (isRecord(value)) {
    for (const [propertyName, propertyValue] of Object.entries(value)) {
      scanForBannedTerms(propertyValue, [...path, propertyName]);
    }
  }
}

function requireNonEmptyField(record, fieldName, path) {
  if (!hasValue(record[fieldName])) {
    addError(`${formatPath([...path, fieldName])} 为必填项且不能为空`);
    return false;
  }

  return true;
}

function validatePrimaryMetadata(record, path) {
  requireNonEmptyField(record, 'sourceId', path);

  if (!hasValue(record.lastVerified)) {
    addError(`${formatPath([...path, 'lastVerified'])} 为必填项`);
  } else if (!validDate(record.lastVerified)) {
    addError(`${formatPath([...path, 'lastVerified'])} 必须是有效的 YYYY-MM-DD 日期`);
  }
}

function validateMajor(record, path) {
  const cohort = record.cohort;
  if (cohort === undefined || cohort === null) {
    addError(`${formatPath([...path, 'cohort'])} 必须是 2025 主版本`);
  } else if (isRecord(cohort)) {
    const cohortYear = cohort.year ?? cohort.value ?? cohort.label;
    if (String(cohortYear) !== '2025') {
      addError(`${formatPath([...path, 'cohort'])} 只允许 2025 主版本`);
    }
  } else if (String(cohort) !== '2025') {
    addError(`${formatPath([...path, 'cohort'])} 只允许 2025 主版本，实际为 ${String(cohort)}`);
  }

  if (record.isPrimary !== undefined && record.isPrimary !== true) {
    addError(`${formatPath([...path, 'isPrimary'])} 必须为 true；仅允许 2025 主版本`);
  }

  const credits = record.credits ?? record.totalCredits;
  if (!Number.isInteger(credits) || ![160, 165].includes(credits)) {
    addError(`${formatPath([...path, 'credits'])} 必须是 160 或 165，实际为 ${String(credits)}`);
  }
}

function validateDualLensCase(record, path) {
  if (!Array.isArray(record.lenses) || record.lenses.length !== 2) {
    addError(`${formatPath([...path, 'lenses'])} 必须恰好包含两个专业透镜`);
    return;
  }

  for (const [index, lens] of record.lenses.entries()) {
    const lensPath = [...path, 'lenses', index];
    if (!isRecord(lens)) {
      addError(`${formatPath(lensPath)} 必须是对象`);
      continue;
    }
    for (const field of ['majorId', 'label', 'role', 'input', 'output', 'interface', 'contribution']) {
      if (!hasValue(lens[field])) addError(`${formatPath([...lensPath, field])} 为必填项且不能为空`);
    }
  }

  for (const field of ['sharedArtifact', 'validation', 'riskBoundary']) {
    if (!hasValue(record[field])) addError(`${formatPath([...path, field])} 为必填项且不能为空`);
  }
}

function validateCapability(record, path) {
  if (!Array.isArray(record.majorEvidence) || record.majorEvidence.length < 2) {
    addError(`${formatPath([...path, 'majorEvidence'])} 至少需要两个专业的课程证据`);
  }
}

function validateScenario(record, path) {
  if (!Array.isArray(record.sharedCapabilities) || record.sharedCapabilities.length === 0) {
    addError(`${formatPath([...path, 'sharedCapabilities'])} 至少需要一个共用能力引用`);
  }
  for (const field of ['extraGate', 'example']) {
    if (!hasValue(record[field])) addError(`${formatPath([...path, field])} 为必填项且不能为空`);
  }
}

function validateProject(record, path) {
  for (const fieldName of PROJECT_REQUIRED_FIELDS) {
    requireNonEmptyField(record, fieldName, path);
  }

  if (!Array.isArray(record.durationBands) || record.durationBands.length === 0 || record.durationBands.some((band) => typeof band !== 'string' || !band.trim())) {
    addError(`${formatPath([...path, 'durationBands'])} 必须是至少包含一个非空字符串的数组`);
  }

  if (!['glimpse', 'try', 'mini-project'].includes(record.level)) {
    addError(`${formatPath([...path, 'level'])} 必须是 glimpse、try 或 mini-project`);
  }

  if (!['individual', 'cross-major'].includes(record.mode)) {
    addError(`${formatPath([...path, 'mode'])} 必须是 individual 或 cross-major`);
  }

  if (!Array.isArray(record.courseEvidence) || record.courseEvidence.length === 0) {
    addError(`${formatPath([...path, 'courseEvidence'])} 必须至少包含一条课程证据`);
  } else {
    record.courseEvidence.forEach((evidence, index) => {
      const evidencePath = [...path, 'courseEvidence', index];
      if (!isRecord(evidence) || !hasValue(evidence.majorId) || !hasValue(evidence.course)) {
        addError(`${formatPath(evidencePath)} 必须包含 majorId 和 course`);
      }
    });
  }

  if (!isRecord(record.data)) {
    addError(`${formatPath([...path, 'data'])} 必须是结构化数据边界对象`);
  } else {
    const { kind, access, sensitivity } = record.data;
    if (!['none', 'synthetic', 'real'].includes(kind)) addError(`${formatPath([...path, 'data', 'kind'])} 值无效`);
    if (!['none', 'open', 'restricted', 'credentialed'].includes(access)) addError(`${formatPath([...path, 'data', 'access'])} 值无效`);
    if (!['none', 'personal', 'health', 'commercial', 'security-relevant'].includes(sensitivity)) addError(`${formatPath([...path, 'data', 'sensitivity'])} 值无效`);
    if (kind === 'none' && access !== 'none') addError(`${formatPath([...path, 'data'])} none 数据只能使用 none 访问级别`);
    if (kind === 'synthetic' && access !== 'open') addError(`${formatPath([...path, 'data'])} synthetic 数据必须使用 open 访问级别`);
    if (kind === 'real' && access === 'none') addError(`${formatPath([...path, 'data'])} real 数据不能使用 none 访问级别`);
  }

  if (!Array.isArray(record.collaborationRoles)) {
    addError(`${formatPath([...path, 'collaborationRoles'])} 必须是数组`);
  } else if (record.mode === 'cross-major') {
    if (!Array.isArray(record.majorIds) || record.majorIds.length < 2) {
      addError(`${formatPath([...path, 'majorIds'])} cross-major 项目必须至少关联两个专业`);
    }
    if (record.collaborationRoles.length < 2) {
      addError(`${formatPath([...path, 'collaborationRoles'])} cross-major 项目必须至少包含两个角色`);
    }
    record.collaborationRoles.forEach((role, index) => {
      const rolePath = [...path, 'collaborationRoles', index];
      if (!isRecord(role)) {
        addError(`${formatPath(rolePath)} 必须是对象`);
        return;
      }
      for (const field of ['id', 'title', 'suggestedMajorIds', 'responsibilities', 'inputs', 'outputs', 'acceptance']) {
        if (!hasValue(role[field])) addError(`${formatPath([...rolePath, field])} 为必填项且不能为空`);
      }
    });
  }

  if (!Array.isArray(record.endpointIds) || record.endpointIds.length < 2) {
    addError(`${formatPath([...path, 'endpointIds'])} 至少需要一个主入口和一个替代入口`);
  }

  if (!isRecord(record.artifactTemplate)) {
    addError(`${formatPath([...path, 'artifactTemplate'])} 必须登记产物模板地址、版本和许可`);
  } else {
    for (const field of ['label', 'href', 'version', 'license']) {
      if (!hasValue(record.artifactTemplate[field])) addError(`${formatPath([...path, 'artifactTemplate', field])} 为必填项`);
    }
  }

  if (record.preview !== undefined) addError(`${formatPath([...path, 'preview'])} 已退役；内容源只能写 previewAssets，禁止双写`);
  const minimumAssets = record.id === 'project-signal-feature-notebook' ? 3 : 2;
  if (!Array.isArray(record.previewAssets) || record.previewAssets.length < minimumAssets) {
    addError(`${formatPath([...path, 'previewAssets'])} 至少需要 ${minimumAssets} 份入口/过程/结果素材`);
  } else {
    const seenSources = new Set();
    record.previewAssets.forEach((asset, index) => {
      const assetPath = [...path, 'previewAssets', index];
      if (!isRecord(asset)) {
        addError(`${formatPath(assetPath)} 必须是素材对象`);
        return;
      }
      for (const field of ['src', 'alt', 'kind', 'author', 'license', 'sourceRef', 'generationRef', 'updatedAt']) {
        if (!hasValue(asset[field])) addError(`${formatPath([...assetPath, field])} 为必填项`);
      }
      if (!validDate(asset.updatedAt)) addError(`${formatPath([...assetPath, 'updatedAt'])} 必须是有效的 YYYY-MM-DD 日期`);
      if (!['project_output', 'process', 'diagram'].includes(asset.kind)) addError(`${formatPath([...assetPath, 'kind'])} kind 无效`);
      if (typeof asset.src === 'string') {
        if (!asset.src.startsWith('/project-previews/')) {
          addError(`${formatPath([...assetPath, 'src'])} 必须来自 /project-previews/`);
        } else {
          if (seenSources.has(asset.src)) addError(`${formatPath([...assetPath, 'src'])} 在同一项目中重复`);
          seenSources.add(asset.src);
          try {
            const assetFile = resolve(PUBLIC_DIRECTORY, asset.src.slice(1));
            const bytes = statSync(assetFile).size;
            if (bytes > 200 * 1024) addError(`${formatPath([...assetPath, 'src'])} 超过单张 200KB 预算：${bytes} bytes`);
          } catch {
            addError(`${formatPath([...assetPath, 'src'])} 指向不存在的素材：${asset.src}`);
          }
        }
      }
    });
    if (!record.previewAssets.some((asset) => asset?.kind === 'project_output')) {
      addError(`${formatPath([...path, 'previewAssets'])} 必须保留至少一份结果/产物预览`);
    }
    if (record.id === 'project-signal-feature-notebook' && !record.previewAssets.some((asset) => asset?.kind === 'process')) {
      addError(`${formatPath([...path, 'previewAssets'])} 代表项目必须包含过程视觉`);
    }
  }

  if (hasValue(record.sourceUrl)) {
    validateHttpsUrl(record.sourceUrl, [...path, 'sourceUrl']);
  }

  validateProjectLinks(record, path);
}

function registerUnique(seen, value, label, path) {
  if (seen.has(value)) {
    addError(`${formatPath(path)} 的 ${label}“${value}”重复（已存在于 ${seen.get(value)}）`);
  } else {
    seen.set(value, formatPath(path));
  }
}

function validateRequiredCollections(data) {
  const globalIds = new Map();
  const globalSlugs = new Map();

  for (const rule of COLLECTION_RULES) {
    const collection = data[rule.key];
    const collectionPath = [rule.key];

    if (!Array.isArray(collection)) {
      addError(`${rule.key} 必须存在且是顶层数组`);
      continue;
    }

    if (collection.length < rule.minimum) {
      addError(`${rule.key} 至少需要 ${rule.minimum} 项，实际为 ${collection.length}`);
    }

    const localIds = new Map();
    const localSlugs = new Map();

    collection.forEach((record, index) => {
      const recordPath = [...collectionPath, index];

      if (!isRecord(record)) {
        addError(`${formatPath(recordPath)} 必须是对象`);
        return;
      }

      if (!hasValue(record.id)) {
        addError(`${formatPath([...recordPath, 'id'])} 为必填项且不能为空`);
      } else if (typeof record.id !== 'string') {
        addError(`${formatPath([...recordPath, 'id'])} 必须是字符串`);
      } else {
        registerUnique(localIds, record.id, 'id', recordPath);
        registerUnique(globalIds, record.id, 'id', recordPath);
      }

      if (!hasValue(record.slug)) {
        addError(`${formatPath([...recordPath, 'slug'])} 为必填项且不能为空`);
      } else if (typeof record.slug !== 'string') {
        addError(`${formatPath([...recordPath, 'slug'])} 必须是字符串`);
      } else {
        registerUnique(localSlugs, record.slug, 'slug', recordPath);
        registerUnique(globalSlugs, record.slug, 'slug', recordPath);
      }

      validatePrimaryMetadata(record, recordPath);

      if (rule.key === 'projects') {
        if (!hasValue(record.owner)) addError(`${formatPath([...recordPath, 'owner'])} 为首页内容必填项`);
        for (const field of ['updatedAt', 'reviewDueAt']) {
          if (!hasValue(record[field])) addError(`${formatPath([...recordPath, field])} 为首页内容必填项`);
          else if (!validDate(record[field])) addError(`${formatPath([...recordPath, field])} 必须是有效的 YYYY-MM-DD 日期`);
        }
        if (validDate(record.updatedAt) && validDate(record.reviewDueAt) && record.reviewDueAt < record.updatedAt) {
          addError(`${formatPath(recordPath)}.reviewDueAt 不能早于 updatedAt`);
        }
      }

      if (rule.key === 'majors') {
        validateMajor(record, recordPath);
      }

      if (rule.key === 'dualLensCases') {
        validateDualLensCase(record, recordPath);
      }

      if (rule.key === 'capabilities') {
        validateCapability(record, recordPath);
      }

      if (rule.key === 'scenarios') {
        validateScenario(record, recordPath);
      }

      if (rule.key === 'projects') {
        validateProject(record, recordPath);
      }
    });
  }
}

function validateUpdates(updates, data) {
  if (!Array.isArray(updates)) {
    addError('updates.json 顶层必须是数组');
    return;
  }
  if (updates.length > 3) addError(`Release B 最近更新最多展示 3 条，实际为 ${updates.length}`);
  const entityCollections = {
    project: data.projects,
    faq: data.faqs,
    'dual-lens-case': data.dualLensCases,
    source: data.sources,
  };
  const seenIds = new Set();
  updates.forEach((update, index) => {
    const path = ['updates', index];
    if (!isRecord(update)) {
      addError(`${formatPath(path)} 必须是对象`);
      return;
    }
    for (const field of ['id', 'entityType', 'entityId', 'kind', 'summary', 'publishedAt', 'owner']) {
      if (!hasValue(update[field])) addError(`${formatPath([...path, field])} 为必填项`);
    }
    if (seenIds.has(update.id)) addError(`${formatPath([...path, 'id'])} 不得重复`);
    seenIds.add(update.id);
    if (!['content-update', 'source-reverification'].includes(update.kind)) addError(`${formatPath([...path, 'kind'])} kind 无效`);
    if (!validDate(update.publishedAt)) addError(`${formatPath([...path, 'publishedAt'])} 必须是有效的 YYYY-MM-DD 日期`);
    const collection = entityCollections[update.entityType];
    if (!collection) addError(`${formatPath([...path, 'entityType'])} 不支持：${update.entityType}`);
    else if (!collection.some((item) => item.id === update.entityId)) addError(`${formatPath([...path, 'entityId'])} 引用了不存在的 ${update.entityType}：${update.entityId}`);
    if (update.kind === 'source-reverification' && !String(update.summary).startsWith('已重新核验来源')) {
      addError(`${formatPath([...path, 'summary'])} source-reverification 必须明确写“已重新核验来源”`);
    }
  });
}

function validateAssetBudgets(data) {
  const allSources = new Set();
  const entrySources = new Set();
  for (const project of data.projects ?? []) {
    for (const asset of project.previewAssets ?? []) if (asset?.src) allSources.add(asset.src);
    if (project.previewAssets?.[0]?.src) entrySources.add(project.previewAssets[0].src);
  }
  const bytesFor = (sources) => [...sources].reduce((total, src) => {
    try {
      return total + statSync(resolve(PUBLIC_DIRECTORY, src.slice(1))).size;
    } catch {
      return total;
    }
  }, 0);
  const entryBytes = bytesFor(entrySources);
  const allBytes = bytesFor(allSources);
  if (entryBytes > 350 * 1024) addError(`项目入口视觉总计 ${entryBytes} bytes，超过移动首屏 350KB 预算`);
  if (allBytes > 500 * 1024) addError(`全部首发项目视觉总计 ${allBytes} bytes，超过桌面首屏 500KB 保守预算`);
}

function printStatistics(data, updates) {
  console.log('Content validation statistics:');

  for (const rule of COLLECTION_RULES) {
    const count = Array.isArray(data?.[rule.key]) ? data[rule.key].length : 0;
    console.log(`  ${rule.key}: ${count} (minimum ${rule.minimum})`);
  }
  console.log(`  updates: ${Array.isArray(updates) ? updates.length : 0} (maximum 3)`);
}

function fail() {
  console.error('Content validation failed.');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

let data;
let updates;

try {
  const raw = readFileSync(DATA_FILE, 'utf8');
  data = JSON.parse(raw);
  updates = JSON.parse(readFileSync(UPDATES_FILE, 'utf8'));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Content validation failed: cannot read or parse ${DATA_FILE}`);
  console.error(`- ${message}`);
  process.exit(1);
}

if (!isRecord(data)) {
  addError('site-data.json 顶层必须是对象');
} else {
  validateRequiredCollections(data);
  validateRelations(data, [], buildCollectionTargets(data));
  validateUpdates(updates, data);
  validateAssetBudgets(data);
  scanForBannedTerms(data, []);
  scanForBannedTerms(updates, ['updates']);
}

printStatistics(data, updates);

if (errors.length > 0) {
  fail();
}

console.log('Content validation passed.');
