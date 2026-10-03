export const api = async (path, method = 'GET', body) => {
  const t = localStorage.getItem('token');
  const res = await fetch('/api' + path, { method, headers: { 'Content-Type': 'application/json', ...(t && { Authorization: 'Bearer ' + t }) }, body: body && JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Request failed'), { data, status: res.status });
  return data;
};
