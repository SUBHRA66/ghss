export class AuthApi {

  static async login (data) {
    try {
      const res = await fetch ('/api/auth/login', {
        method       : 'POST',
        headers      : { 'Content-Type': 'application/json' },
        credentials  : 'include',
        body         : JSON.stringify (data),
      })

      const data = res.json();
    } catch (err) {
      throw new Error ('failed to connect with authentication server' );
    }
  }

}
