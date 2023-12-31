import { InvocationContext } from '@azure/functions';
import { buildOortQuery } from '../../shared/connector';

export const COMPL_TYPE_MAP: Record<string, string> = {
  '1': 'GLS',
  '2': 'OSH',
  '3': 'OSH',
  '4': 'SS',
};

const GET_UNASSIGNED_COMPLAINTS = (queryName: string) =>
  JSON.stringify({
    operationName: 'GetUnassignedComplaints',
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
    query: `query GetUnassignedComplaints(
      $first: Int
      $filter: JSON
      $sortField: String
      $sortOrder: String
      $styles: JSON
    ) {
      ${queryName}(
        first: $first
        sortField: $sortField
        sortOrder: $sortOrder
        filter: $filter
        styles: $styles
      ) {
        edges {
          node {
            canUpdate
            canDelete
            id
            incrementalId
            compl_type
            region {
              Name
            }
          }
          meta
        }
        totalCount
      }
    }`,
  });

type UnassignedComplaintsResponse = {
  edges: {
    node: {
      id: string;
      incrementalId: string;
      compl_type: string[] | string;
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

    return data.edges.map((edge) => {
      const compType =
        typeof edge.node.compl_type === 'string'
          ? edge.node.compl_type
          : edge.node.compl_type?.[0];

      return {
        id: edge.node.id,
        incrementalId: edge.node.incrementalId,
        region: edge.node.region?.Name,
        complaintType: COMPL_TYPE_MAP[compType ?? '1'],
        rejectedBy: undefined as string | undefined,
      };
    });
  } catch (err) {
    context.error('Error fetching unassigned complaints:', err);
    return [];
  }
};
