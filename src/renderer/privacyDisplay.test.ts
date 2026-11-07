import * as React from 'react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AppSettings, RuntimeStatus } from '../shared/contracts';
import { SettingsModal } from './components/SettingsModal';
import { redactPersonalText, runtimeLabel, toMessage } from './ui';

// Deliberately fictional identifiers detect accidental disclosure in rendered UI.
const runtime: RuntimeStatus = {
  state: 'ready',
  binaryPath: '/Users/demo-fixture/tools/codex',
  version: 'test',
  codexHome: '/Users/demo-fixture/app-data/codex-home',
  account: { type: 'chatgpt', email: 'demo-fixture@example.invalid', planType: null },
  models: [],
  capabilities: {
    namespaceTools: false,
    imageGeneration: false,
    externalImageGeneration: false,
    webSearch: false,
  },
  error: null,
};

describe('public demonstration privacy', () => {
  beforeEach(() => {
    vi.stubGlobal('window', { noobi: {} });
    vi.stubGlobal('React', React);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('renders account settings without the account email or machine paths', () => {
    const markup = renderToStaticMarkup(createElement(SettingsModal, {
      value: { defaultWorkspace: '/tmp/demo', defaultModel: null } as AppSettings,
      runtime,
      onClose: () => undefined,
      onSaved: () => undefined,
      onRuntime: () => undefined,
    }));

    expect(markup).toContain('已登录账号');
    expect(markup).toContain('已定位本地运行时');
    expect(markup).toContain('应用独立数据目录');
    expect(markup).not.toContain('demo-fixture');
    expect(markup).not.toContain('/Users/');
  });

  it('preserves readiness and diagnostics without exposing account identifiers', () => {
    expect(runtimeLabel(runtime)).toBe('Codex 账号 · 已就绪');
    expect(runtimeLabel({ ...runtime, account: null })).toBe('Codex 已就绪 · 未登录');
    expect(toMessage(new Error('Cannot open /Users/demo-fixture/file.txt for demo-fixture@example.invalid')))
      .toBe('Cannot open /Users/<user>/file.txt for <email>');
  });

  it('redacts macOS, Linux, and Windows home names while keeping useful path context', () => {
    expect(redactPersonalText('/Users/demo-fixture/a /home/demo-fixture/b'))
      .toBe('/Users/<user>/a /home/<user>/b');
    expect(redactPersonalText('C:\\Users\\demo-fixture\\project\\file.txt'))
      .toBe('C:\\Users\\<user>\\project\\file.txt');
    expect(redactPersonalText('src/main/file.ts')).toBe('src/main/file.ts');
  });
});
