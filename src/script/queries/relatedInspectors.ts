import { InvocationContext } from '@azure/functions';
import { buildOortQuery } from '../connector';

const SPECIALIZATION_MAP: Record<string, string> = {
  '1': 'GLS',
  '2': 'OSH',
  '3': 'SS',
};

const GET_RELATED_INSPECTORS = (queryName: string) =>
  JSON.stringify({
    operationName: 'GetCustomQuery',
    variables: {
      first: 100,
      filter: {
        logic: 'and',
        filters: [
          {
            field: 'role',
            operator: 'eq',
            value: '1',
          },
        ],
      },
    },
    query: `query GetCustomQuery($first: Int, $filter: JSON) {\n  ${queryName}(\n    first: $first\n    filter: $filter) {\n    edges {\n      node {\n        canUpdate\n        canDelete\n        id\n        username\n        region {\n          Region\n          __typename\n        }\n        specialization\n        fullname\n        __typename\n      }\n      meta\n      __typename\n    }\n    totalCount\n    __typename\n  }\n}`,
  });

type InspectorsResponse = {
  [key in string]: {
    edges: {
      node: {
        id: string;
        region?: {
          Region: string;
        };
        specialization: string[];
        fullname: string;
        username: string[];
      };
    }[];

    totalCount: number;
  };
};

export const getRelatedInspectors = async (
  queryName: string,
  context: InvocationContext
) => {
  try {
    const res = await buildOortQuery<InspectorsResponse>(
      GET_RELATED_INSPECTORS(queryName)
    );

    return res[queryName].edges.map((edge) => ({
      id: edge.node.id,
      region: edge.node.region?.Region,
      specialization: edge.node.specialization.map(
        (specialization) => SPECIALIZATION_MAP[specialization]
      ),
      name: edge.node.fullname,
      user: edge.node.username[0],
    }));
  } catch (err) {
    context.error('Error fetching inspectors:', err);
    return [];
  }
};
