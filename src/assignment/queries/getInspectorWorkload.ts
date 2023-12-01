import { InvocationContext } from '@azure/functions';
import { buildOortQuery } from '../../shared/connector';

const GET_INSPECTOR_WORKLOAD = (queryName: string, user: string) =>
  JSON.stringify({
    operationName: 'GetInspectorWorkload',
    variables: {
      first: 10,
      filter: {
        logic: 'and',
        filters: [
          {
            field: 'last_inspector_assigned_users',
            operator: 'contains',
            value: [`${user}`],
          },
          {
            field: 'complaint_status',
            operator: 'neq',
            value: 'Closed',
          },
        ],
      },
      sortOrder: 'asc',
      styles: [],
    },
    query: `query GetInspectorWorkload($first: Int, $skip: Int, $filter: JSON, $sortField: String, $sortOrder: String, $display: Boolean, $styles: JSON) {\n  ${queryName}(\n    first: $first\n    skip: $skip\n    sortField: $sortField\n    sortOrder: $sortOrder\n    filter: $filter\n    display: $display\n    styles: $styles\n  ) {\n    edges {\n      node {\n        canUpdate\n        canDelete\n        id\n        id\n        __typename\n      }\n      meta\n      __typename\n    }\n    totalCount\n    __typename\n  }\n}`,
  });

type InspectorWorkloadResponse = {
  totalCount: number;
};

export const getInspectorWorkload = async (
  queryName: string,
  user: string,
  context: InvocationContext
) => {
  try {
    const res = await buildOortQuery<any>(
      GET_INSPECTOR_WORKLOAD(queryName, user)
    );
    const data = res[queryName] as InspectorWorkloadResponse;
    return data.totalCount;
  } catch (err) {
    context.error('Error fetching inspector workload:', err);
    return Infinity;
  }
};
