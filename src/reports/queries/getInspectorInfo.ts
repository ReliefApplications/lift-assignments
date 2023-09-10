import { InvocationContext } from '@azure/functions';
import { buildOortQuery } from '../../shared/connector';

const GET_INSPECTOR_DETAILS = (id: string) =>
  JSON.stringify({
    operationName: 'GetInspectorInfo',
    variables: {
      id,
    },
    query: `query GetInspectorInfo($id: ID!) {
        user(id: $id) {
          name
        }
      }`,
  });

type InspectorDetailsResponse = {
  user: {
    name: string;
  };
};

export const getInspectorDetails = async (
  inspectorID: string,
  token: string,
  context: InvocationContext
) => {
  try {
    const res = await buildOortQuery<InspectorDetailsResponse>(
      GET_INSPECTOR_DETAILS(inspectorID),
      token
    );

    return res.user;
  } catch (err) {
    context.error('Error fetching inspector details:', err);
    return null;
  }
};
