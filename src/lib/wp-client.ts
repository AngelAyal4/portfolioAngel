export type FetchGraphQLOptions = {
  variables?: Record<string, unknown>;
  headers?: Record<string, string>;
  nextFetchOptions?: RequestInit;
};

const WP_URL =
  import.meta.env.WP_GRAPHQL_URL ??
  import.meta.env.PUBLIC_WP_GRAPHQL_URL ??
  "http://localhost:8080/graphql";

export async function fetchGraphQL<T>(
  query: string,
  options: FetchGraphQLOptions = {}
): Promise<T> {
  const { variables, headers, nextFetchOptions } = options;

  const res = await fetch(WP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({ query, variables }),
    ...nextFetchOptions,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`WPGraphQL HTTP ${res.status}: ${text.slice(0, 500)}`);
  }

  const json = (await res.json()) as import("./types").GraphQLResponse<T>;

  if (json.errors?.length) {
    throw new Error(`WPGraphQL: ${json.errors.map((e) => e.message).join(" | ")}`);
  }
  if (!json.data) throw new Error("WPGraphQL: respuesta sin data");

  return json.data;
}
