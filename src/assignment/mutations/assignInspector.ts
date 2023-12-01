import { InvocationContext } from '@azure/functions';
import { buildOortQuery } from '../../shared/connector';

const ASSIGN_INSPECTOR = (
  request: string,
  inspector: string,
  reassignment: boolean
) =>
  JSON.stringify({
    operationName: 'AssignInspector',
    variables: {
      id: `${request}`,
      data: Object.assign(
        // Variables present in both reassignment and assignment
        {
          last_inspector_assigned_users: [inspector],
          to_do_inspector: 'Accept case',
        },
        reassignment
          ? // Variables present only in reassignment
            {
              date_reassignment: new Date().toISOString(),
              complaint_status: 'Reassigned to another inspector',
              to_do_manager: 'Reassigned to another inspector',
              reassignment_bool: true,
              inspector_reassigned_rejection: [inspector],
            }
          : // Variables present only in first assignment
            {
              date_assignment: new Date().toISOString(),
              complaint_status: 'Assigned to inspector',
              to_do_manager: 'Assigned to inspector',
              inspector_assigned_users: [inspector],
            }
      ),
    },
    query: `mutation AssignInspector($id: ID!, $data: JSON!) {
      editRecord(id: $id, data: $data) {
        id
        data
      }
    }`,
  });

export const assignInspector = async (
  request: string,
  inspector: string,
  isReassignment: boolean,
  context: InvocationContext
) => {
  await buildOortQuery<any>(
    ASSIGN_INSPECTOR(request, inspector, isReassignment)
  ).catch((err) => {
    context.error('Error assigning inspector: ', err);
  });
};
