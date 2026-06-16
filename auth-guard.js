async function requireSesion() {
    const { data: { session } } = await window.clienteSupabase.auth.getSession();
    if (!session) {
      window.location.href = "inicio_sesion.html";
      return null;
    }
    return session;
  }
  
  async function requireAdmin() {
    const session = await requireSesion();
    if (!session) return null;
  
    const { data: perfil, error } = await window.clienteSupabase
      .from("perfiles")
      .select("rol")
      .eq("id", session.user.id)
      .single();
  
    if (error || !perfil || perfil.rol !== "admin") {
      alert("No tienes permisos de administrador.");
      window.location.href = "Form_compra.html";
      return null;
    }
    return session;
  }