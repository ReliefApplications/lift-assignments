import { InvocationContext } from '@azure/functions';
import { buildOortQuery } from '../../shared/connector';

const GET_CASE_FORM = (caseID: string) =>
  JSON.stringify({
    operationName: 'GetCustomQuery',
    variables: { id: caseID },
    query: `query GetCustomQuery($id: ID!) {
        record(id: $id) {
          id
          form {
            id
            structure
            queryName
          }
        }
      }`,
  });

type CaseFormResponse = {
  record: {
    id: string;
    form: {
      id: string;
      structure: string;
      queryName: string;
    };
  };
};

export const getCaseForm = async (
  queryName: string,
  token: string,
  context: InvocationContext
) => {
  try {
    // First we need to get the queryName for the case record
    const caseFormRes = await buildOortQuery<CaseFormResponse>(
      GET_CASE_FORM(queryName),
      token
    );
    return caseFormRes.record.form;
  } catch (err) {
    context.error('Error fetching case form:', err);
    return null;
  }
};
