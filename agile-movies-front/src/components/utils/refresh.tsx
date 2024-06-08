export async function RefreshToken() {
  const refresh_token = localStorage.getItem('refreshToken');

  if (refresh_token) {
    try {
      const response = await fetch('http://161.35.140.236:9005/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          refresh_token,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.payload.token);
      } else {
        throw new Error('Error al intentar renovar el token');
      }
    } catch (error:any) {
      throw new Error('Error de red: ' + error.message);
    }
  } else {
    throw new Error('No se encontró el refresh_token en el localStorage');
  }
}

  