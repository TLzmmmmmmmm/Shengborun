export interface TechnicalParameterItem {
  name: string;
  value: string;
}

export interface TechnicalParameterInput {
  group?: string;
  items: TechnicalParameterItem[];
}

export function prepareTechnicalParameters(
  parameters: readonly TechnicalParameterInput[],
) {
  const groups = parameters.map((parameter, index) => ({
    id: `parameter-group-${index}`,
    label: parameter.group ?? '技术参数',
    items: parameter.items,
  }));
  const allItems = groups.flatMap(({ items }) => items);

  return { groups, allItems, isEmpty: allItems.length === 0 };
}
