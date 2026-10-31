async function requireAdmin() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return location.replace('login.html');
  const { data } = await sb.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle();
  if (!data) { await sb.auth.signOut(); return location.replace('login.html'); }
  document.body.hidden = false; return session;
}
const logout = async () => { await sb.auth.signOut(); location.replace('login.html'); };
