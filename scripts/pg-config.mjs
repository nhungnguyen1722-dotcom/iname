export function pgConfig(connectionString) {
  const url = new URL(connectionString);
  url.searchParams.delete("channel_binding");
  const sslmode = url.searchParams.get("sslmode");
  const remote = Boolean(sslmode && sslmode !== "disable");
  return {
    connectionString: url.toString(),
    ssl: remote ? { rejectUnauthorized: false } : undefined,
  };
}
