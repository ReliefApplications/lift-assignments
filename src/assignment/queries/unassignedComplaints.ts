import { InvocationContext } from '@azure/functions';
import { buildOortQuery } from '../../shared/connector';

const COMPL_TYPE_MAP: Record<string, string> = {
  '1': 'GLS',
  '2': 'OSH',
  '3': 'OSH',
  '4': 'SS',
};

const GET_UNASSIGNED_COMPLAINTS = (queryName: string) =>
  JSON.stringify({
    operationName: 'GetCustomQuery',
    variables: {
      first: 50,
      filter: {
        logic: 'and',
        filters: [
          {
            field: 'complaint_status',
            operator: 'eq',
            value: 'Case validated',
          },
        ],
      },
      sortField: 'createdAt',
      sortOrder: 'desc',
      styles: [],
    },
    query: `query GetCustomQuery($first: Int, $skip: Int, $filter: JSON, $sortField: String, $sortOrder: String, $display: Boolean, $styles: JSON) {\n  ${queryName}(\n    first: $first\n    skip: $skip\n    sortField: $sortField\n    sortOrder: $sortOrder\n    filter: $filter\n    display: $display\n    styles: $styles\n  ) {\n    edges {\n      node {\n        canUpdate\n        canDelete\n        id\n        incrementalId\n        compl_type\n        region {\n          Name\n          __typename\n        }\n        __typename\n      }\n      meta\n      __typename\n    }\n    totalCount\n    __typename\n  }\n}`,
  });

type UnassignedComplaintsResponse = {
  edges: {
    node: {
      id: string;
      incrementalId: string;
      compl_type: string;
      region?: {
        Name: string;
      };
    };
  }[];
};

export const getUnassignedComplaints = async (
  queryName: string,
  context: InvocationContext
) => {
  try {
    const res = await buildOortQuery<any>(GET_UNASSIGNED_COMPLAINTS(queryName));
    const data = res[queryName] as UnassignedComplaintsResponse;

    return data.edges.map((edge) => ({
      id: edge.node.id,
      incrementalId: edge.node.incrementalId,
      region: edge.node.region?.Name,
      complaintType: COMPL_TYPE_MAP[edge.node.compl_type ?? '1'],
    }));
  } catch (err) {
    context.error('Error fetching unassigned complaints:', err);
    return [];
  }
};
