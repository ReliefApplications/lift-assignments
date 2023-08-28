import { Keycloak } from 'keycloak-backend';

const keycloak = new Keycloak({
  realm: process.env.KEYCLOAK_REALM || '',
  keycloak_base_url: process.env.KEYCLOAK_AUTH_URL || '',
  client_id: process.env.KEYCLOAK_CLIENT_ID || '',
  username: process.env.KEYCLOAK_USERNAME || '',
  password: process.env.KEYCLOAK_PASSWORD || '',

  // This should be false if the keycloak version is under 18
  is_legacy_endpoint: false,
});

export const getOortToken = async () => {
  return await keycloak.accessToken.get();
};

/**
 * Builds a query string to be used in a GraphQL request
 *
 * @param query Query string, variables should be in the format of $variableName
 * @param variables Object containing the variables to be used in the query
 */
export const buildOortQuery = async <T>(query: string) => {
  let parsedQuery = query;

  const token = await getOortToken();

  return new Promise<T>(async (resolve, reject) => {
    fetch(process.env.OORT_GRAPHQL_URL || '', {
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: parsedQuery,
      method: 'POST',
    })
      .then((res) => {
        res.json().then((json) => {
          if (json?.errors) {
            reject(json?.errors);
          }
          resolve(json?.data);
        });
      })
      .catch((err) => {
        reject(err);
      });
  });
};
