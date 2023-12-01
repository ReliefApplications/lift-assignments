import { InvocationContext } from '@azure/functions';
import { buildOortQuery } from '../../shared/connector';
import { COMPL_TYPE_MAP } from './unassignedComplaints';

const GET_REJECTED_COMPLAINTS = (queryName: string) =>
  JSON.stringify({
    operationName: 'GetRejectedComplaints',
    variables: {
      first: 50,
      filter: {
        logic: 'and',
        filters: [
          {
            field: 'accept',
            operator: 'eq',
            value: false,
          },
          {
            field: 'reason_for_declining',
            operator: 'isnotempty',
            value: null,
          },
          {
            field: 'reassignment_bool',
            operator: 'neq',
            value: true,
          },
        ],
      },
      sortField: 'createdAt',
      sortOrder: 'desc',
      styles: [],
    },
    query: `query GetRejectedComplaints(
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
            id
            last_inspector_assigned_users
            incrementalId
            compl_type
            accept
            reason_for_declining
            reassignment_bool
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

type RejectedComplaintsResponse = {
  edges: {
    node: {
      id: string;
      incrementalId: string;
      last_inspector_assigned_users: string[];
      compl_type: string[] | string;
      region?: {
        Name: string;
      };
    };
  }[];
};

export const getRejectedComplaints = async (
  queryName: string,
  context: InvocationContext
) => {
  try {
    const res = await buildOortQuery<any>(GET_REJECTED_COMPLAINTS(queryName));
    const data = res[queryName] as RejectedComplaintsResponse;
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
        rejectedBy: edge.node.last_inspector_assigned_users?.[0],
      };
    });
  } catch (err) {
    context.error('Error fetching unassigned complaints:', err);
    return [];
  }
};
