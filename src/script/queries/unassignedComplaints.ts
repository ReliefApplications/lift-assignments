import { InvocationContext } from '@azure/functions';
import { buildOortQuery } from '../connector';

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
            logic: 'and',
            filters: [
              {
                field: 'complaint_receivable',
                operator: 'eq',
                value: true,
              },
              {
                logic: 'or',
                filters: [
                  {
                    field: 'complaint_status',
                    operator: 'eq',
                    value: 'Registered',
                  },
                  {
                    field: 'complaint_status',
                    operator: 'eq',
                    value: 'Rejected background',
                  },
                ],
              },
            ],
          },
        ],
      },
      sortField: 'createdAt',
      sortOrder: 'desc',
      styles: [],
    },
    query: `query GetCustomQuery($first: Int, $skip: Int, $filter: JSON, $sortField: String, $sortOrder: String, $display: Boolean, $styles: JSON) {\n  ${queryName}(\n    first: $first\n    skip: $skip\n    sortField: $sortField\n    sortOrder: $sortOrder\n    filter: $filter\n    display: $display\n    styles: $styles\n  ) {\n    edges {\n      node {\n        canUpdate\n        canDelete\n        id\n        incrementalId\n        compl_type\n        region {\n          Region\n          __typename\n        }\n        __typename\n      }\n      meta\n      __typename\n    }\n    totalCount\n    __typename\n  }\n}`,
  });

type UnassignedComplaintsResponse = {
  edges: {
    node: {
      id: string;
      incrementalId: string;
      compl_type: string[];
      region?: {
        Region: string;
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
      region: edge.node.region?.Region,
      complaintType: edge.node.compl_type.map((type) => COMPL_TYPE_MAP[type]),
    }));
  } catch (err) {
    context.error('Error fetching unassigned complaints:', err);
    return [];
  }
};
