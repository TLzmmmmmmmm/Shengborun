import type { Page } from '@playwright/test';

const multiGroupParameters = [
  {
    label: '一般规格',
    items: [
      { name: '夹具频率范围', value: '400–480 MHz' },
      { name: '夹具输出功率', value: '2 W' },
    ],
  },
  {
    label: '接收参数',
    items: [
      { name: '夹具灵敏度', value: '0.25 μV' },
      { name: '夹具信道数量', value: '16' },
    ],
  },
  {
    label: '环境参数',
    items: [
      { name: '夹具工作温度', value: '−20°C–55°C' },
      { name: '夹具防护等级', value: 'IP54' },
    ],
  },
] as const;

export async function installMultiGroupParameterFixture(page: Page) {
  await page.addInitScript((groups) => {
    const observer = new MutationObserver(() => {
      const root = document.querySelector<HTMLElement>('[data-technical-parameters]');
      const tabTemplate = root?.querySelector<HTMLButtonElement>('[data-parameter-tab]');
      const panelTemplate = root?.querySelector<HTMLElement>('[data-parameter-panel]');
      const desktopRowTemplate = panelTemplate?.querySelector<HTMLTableRowElement>('tr');
      const mobileBody = root?.querySelector<HTMLTableSectionElement>(
        '[data-mobile-parameter-table] tbody',
      );
      const mobileRowTemplate = mobileBody?.querySelector<HTMLTableRowElement>('tr');
      const tabList = tabTemplate?.parentElement;
      const panelList = panelTemplate?.parentElement;

      if (
        !root ||
        !tabTemplate ||
        !panelTemplate ||
        !desktopRowTemplate ||
        !mobileBody ||
        !mobileRowTemplate ||
        !tabList ||
        !panelList
      ) {
        return;
      }

      observer.disconnect();

      const cloneRow = (template: HTMLTableRowElement, name: string, value: string) => {
        const row = template.cloneNode(true) as HTMLTableRowElement;
        const heading = row.querySelector('th');
        const cell = row.querySelector('td');
        if (!heading || !cell) throw new Error('Technical parameter row template is incomplete');
        heading.textContent = name;
        cell.textContent = value;
        return row;
      };

      const tabs = groups.map((group, index) => {
        const tab = tabTemplate.cloneNode(true) as HTMLButtonElement;
        tab.id = `parameter-tab-${index}`;
        tab.textContent = group.label;
        tab.setAttribute('aria-selected', String(index === 0));
        tab.setAttribute('aria-controls', `parameter-panel-${index}`);
        tab.tabIndex = index === 0 ? 0 : -1;
        return tab;
      });

      const panels = groups.map((group, index) => {
        const panel = panelTemplate.cloneNode(true) as HTMLElement;
        const body = panel.querySelector('tbody');
        if (!body) throw new Error('Technical parameter panel template is incomplete');
        panel.id = `parameter-panel-${index}`;
        panel.setAttribute('aria-labelledby', `parameter-tab-${index}`);
        panel.hidden = index !== 0;
        body.replaceChildren(
          ...group.items.map((item) => cloneRow(desktopRowTemplate, item.name, item.value)),
        );
        return panel;
      });

      tabList.replaceChildren(...tabs);
      panelList.replaceChildren(...panels);
      mobileBody.replaceChildren(
        ...groups.flatMap((group) =>
          group.items.map((item) => cloneRow(mobileRowTemplate, item.name, item.value)),
        ),
      );
      root.setAttribute('data-test-parameter-fixture', 'multi-group');
    });

    observer.observe(document, { childList: true, subtree: true });
  }, multiGroupParameters);
}
