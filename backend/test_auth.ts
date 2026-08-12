import { AuthService } from './src/modules/auth/auth.service';

async function test() {
  const auth = new AuthService();
  try {
    const res = await auth.login({
      email: 'admin@minierp.com',
      password: 'password123'
    });
    console.log('SUCCESS:', res);
  } catch (err) {
    console.error('ERROR:', err);
  }
}

test();
