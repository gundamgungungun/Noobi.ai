import type {
  AgentEventKind,
  PipelineStage,
  ProjectStatus,
  RuntimeStatus,
} from '../shared/contracts';

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: '待启动',
  running: '制作中',
  waiting: '待继续',
  completed: '已完成',
  failed: '需处理',
  stopped: '已停止',
};

export const EVENT_KIND_LABELS: Record<AgentEventKind, string> = {
  user: '用户',
  lifecycle: '状态',
  assistant: 'Agent',
  thought: '思考',
  tool: '工具',
  file: '文件',
  plan: '计划',
  approval: '审批',
  error: '异常',
};

export function runtimeLabel(runtime: RuntimeStatus): string {
  if (runtime.state === 'ready') {
    return runtime.account
      ? 'Codex 账号 · 已就绪'
      : 'Codex 已就绪 · 未登录';
  }
  if (runtime.state === 'starting') return 'Codex 正在启动';
  if (runtime.state === 'error') return redactPersonalText(runtime.error ?? 'Codex 启动失败');
  return 'Codex 尚未启动';
}

export function stageProgress(stage: PipelineStage): number {
  const order: PipelineStage[] = [
    'brief',
    'scaffold',
    'gdd',
    'assets',
    'world',
    'code',
    'verify',
    'complete',
  ];
  return Math.max(0, order.indexOf(stage));
}

export function formatRelative(value: string): string {
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return '—';
  const delta = Math.max(0, Date.now() - time);
  if (delta < 60_000) return '刚刚';
  if (delta < 3_600_000) return `${Math.floor(delta / 60_000)}m`;
  if (delta < 86_400_000) return `${Math.floor(delta / 3_600_000)}h`;
  return `${Math.floor(delta / 86_400_000)}d`;
}

/** Hide account identifiers in machine diagnostics and read-only path labels. */
export function redactPersonalText(value: string): string {
  return value
    .replace(/(\/(?:Users|home)\/)[^/\\\s]+/gu, '$1<user>')
    .replace(/([A-Za-z]:[\\/](?:Users|Documents and Settings)[\\/])[^\\/\r\n]+/giu, '$1<user>')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/giu, '<email>');
}

export function toMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return redactPersonalText(message.replace(
    /^Error invoking remote method '[^']+':\s*(?:Error:\s*)?/,
    '',
  ));
}
