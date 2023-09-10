import { InvocationContext } from '@azure/functions';
import { buildOortQuery } from '../../shared/connector';

const GET_CASE_DETAILS = (caseID: string, queryName: string) =>
  JSON.stringify({
    operationName: 'GetCustomQuery',
    variables: {
      first: 1,
      filter: {
        logic: 'and',
        filters: [{ field: 'id', operator: 'eq', value: caseID }],
      },
    },
    query: `query GetCustomQuery(
        $first: Int
        $filter: JSON
      ) {
        ${queryName}(
          first: $first
          filter: $filter
        ) {
          edges {
            node {
              id
              incrementalId
              inspector_assigned_users

              checklist_gls_actions
              checklist_osh_ps_actions
              checklist_osh_a_i_actions
              checklist_social_security_actions

              follow_up
              follow_up_2
              follow_up_3
              follow_up_4
              follow_up_5

              checklist_gls_follow_up
              checklist_gls_follow_up_2
              checklist_gls_follow_up_3
              checklist_gls_follow_up_4
              checklist_gls_follow_up_5
              
              checklist_social_security_follow_up
              checklist_social_security_follow_up_2
              checklist_social_security_follow_up_3
              checklist_social_security_follow_up_4
              checklist_social_security_follow_up_5

              checklist_osh_ps_follow_up
              checklist_osh_ps_follow_up_2
              checklist_osh_ps_follow_up_3
              checklist_osh_ps_follow_up_4
              checklist_osh_ps_follow_up_5

              checklist_osh_a_i_follow_up
              checklist_osh_a_i_follow_up_2
              checklist_osh_a_i_follow_up_3
              checklist_osh_a_i_follow_up_4
              checklist_osh_a_i_follow_up_5

              date_inspection_conducted
              date_follow_up
              date_follow_up_2
              date_follow_up_3
              date_follow_up_4
              date_follow_up_5

              inspection_report_comment
              follow_up_comment
              follow_up_2_comment
              follow_up_3_comment
              follow_up_4_comment
              follow_up_5_comment

              enterprise_context {
                id
                name
                address
                incrementalId
                legal_rep_first_name
                legal_rep_last_name
              }
            }
          }
        }
      }`,
  });

export type Checklist = {
  [key in string]: {
    issue_noted: boolean;
    checklist_comment: string;
    checklist_inspection_action: string;
    follow_up_status?: string;
    follow_up_comment?: string;
    follow_up_action?: string;
    follow_up_2_status?: string;
    follow_up_2_comment?: string;
    follow_up_2_action?: string;
    follow_up_3_status?: string;
    follow_up_3_comment?: string;
    follow_up_3_action?: string;
    follow_up_4_status?: string;
    follow_up_4_comment?: string;
    follow_up_4_action?: string;
    follow_up_5_status?: string;
    follow_up_5_comment?: string;
    follow_up_5_action?: string;
  };
};
type CaseDetailsResponse = {
  [key in string]: {
    edges: {
      node: {
        id: string;
        incrementalId: string;
        date_inspection_conducted: string;
        inspector_assigned_users: string[];

        checklist_gls_actions: Checklist;
        checklist_osh_a_i_actions: Checklist;
        checklist_osh_ps_actions: Checklist;
        checklist_social_security_actions: Checklist;

        follow_up: boolean;
        follow_up_2: boolean;
        follow_up_3: boolean;
        follow_up_4: boolean;
        follow_up_5: boolean;

        checklist_gls_follow_up: any;
        checklist_gls_follow_up_2: any;
        checklist_gls_follow_up_3: any;
        checklist_gls_follow_up_4: any;
        checklist_gls_follow_up_5: any;

        checklist_social_security_follow_up: any;
        checklist_social_security_follow_up_2: any;
        checklist_social_security_follow_up_3: any;
        checklist_social_security_follow_up_4: any;
        checklist_social_security_follow_up_5: any;

        checklist_osh_ps_follow_up: any;
        checklist_osh_ps_follow_up_2: any;
        checklist_osh_ps_follow_up_3: any;
        checklist_osh_ps_follow_up_4: any;
        checklist_osh_ps_follow_up_5: any;

        checklist_osh_a_i_follow_up: any;
        checklist_osh_a_i_follow_up_2: any;
        checklist_osh_a_i_follow_up_3: any;
        checklist_osh_a_i_follow_up_4: any;
        checklist_osh_a_i_follow_up_5: any;

        date_follow_up: string;
        date_follow_up_2: string;
        date_follow_up_3: string;
        date_follow_up_4: string;
        date_follow_up_5: string;

        inspection_report_comment: string;
        follow_up_comment: string;
        follow_up_2_comment: string;
        follow_up_3_comment: string;
        follow_up_4_comment: string;
        follow_up_5_comment: string;

        enterprise_context: {
          id: string;
          name: string;
          address: string;
          incrementalId: string;
          legal_rep_first_name: string;
          legal_rep_last_name: string;
        };
      };
    }[];
  };
};

export const getCaseDetails = async (
  caseID: string,
  queryName: string,
  token: string,
  context: InvocationContext
) => {
  try {
    // First we need to get the queryName for the case record
    const res = await buildOortQuery<CaseDetailsResponse>(
      GET_CASE_DETAILS(caseID, queryName),
      token
    );

    return res[queryName]?.edges?.[0]?.node ?? null;
  } catch (err) {
    context.error('Error fetching case details:', err);
    return null;
  }
};
