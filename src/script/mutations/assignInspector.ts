import { InvocationContext } from '@azure/functions';
import { buildOortQuery } from '../connector';

const ASSIGN_INSPECTOR = (request: string, inspector: string) =>
  JSON.stringify({
    operationName: 'editRecord',
    variables: {
      id: `${request}`,
      data: {
        date_assignment: new Date().toISOString(),
        inspector_assigned_users: [`${inspector}`],
        complaint_status: 'Assigned to inspector',
        to_do_inspector: 'Accept case',
        to_do_manager: 'Assigned to inspector',
      },
    },
    query:
      'mutation editRecord($id: ID!, $data: JSON!) {\n  editRecord(id: $id, data: $data) {\n    id\n    data\n    __typename\n  }\n}',
  });

export const assignInspector = async (
  request: string,
  inspector: string,
  context: InvocationContext
) => {
  await buildOortQuery<any>(ASSIGN_INSPECTOR(request, inspector)).catch(
    (err) => {
      context.error('Error assigning inspector: ', err);
    }
  );
};
