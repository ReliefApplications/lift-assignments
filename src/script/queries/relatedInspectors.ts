import { InvocationContext } from '@azure/functions';
import { buildOortQuery } from '../connector';

const SPECIALIZATION_MAP: Record<string, string> = {
  '1': 'GLS',
  '2': 'OSH',
  '3': 'SS',
};

const GET_RELATED_INSPECTORS = (form: string) =>
  JSON.stringify({
    operationName: 'GetCustomQuery',
    variables: {
      first: 10,
      filter: {
        logic: 'and',
        filters: [
          {
            field: 'form',
            operator: 'eq',
            value: `${form}`,
          },
        ],
      },
      sortOrder: 'asc',
      styles: [],
    },
    query:
      'query GetCustomQuery($first: Int, $skip: Int, $filter: JSON, $sortField: String, $sortOrder: String, $display: Boolean, $styles: JSON) {\n  allInspectors(\n    first: $first\n    skip: $skip\n    sortField: $sortField\n    sortOrder: $sortOrder\n    filter: $filter\n    display: $display\n    styles: $styles\n  ) {\n    edges {\n      node {\n        canUpdate\n        canDelete\n        id\n        email\n        inspector_region {\n          Region\n          __typename\n        }\n        specialization\n        fullname\n        __typename\n      }\n      meta\n      __typename\n    }\n    totalCount\n    __typename\n  }\n}',
  });

type InspectorsResponse = {
  allInspectors: {
    edges: {
      node: {
        id: string;
        inspector_region?: {
          Region: string;
        };
        specialization: string[];
        fullname: string;
        email: string[];
      };
    }[];

    totalCount: number;
  };
};

export const getRelatedInspectors = async (
  form: string,
  context: InvocationContext
) => {
  try {
    const res = await buildOortQuery<InspectorsResponse>(
      GET_RELATED_INSPECTORS(form)
    );

    return res.allInspectors.edges.map((edge) => ({
      id: edge.node.id,
      region: edge.node.inspector_region?.Region,
      specialization: edge.node.specialization.map(
        (specialization) => SPECIALIZATION_MAP[specialization]
      ),
      name: edge.node.fullname,
      user: edge.node.email[0],
    }));
  } catch (err) {
    context.error('Error fetching inspectors:', err);
    return [];
  }
};
