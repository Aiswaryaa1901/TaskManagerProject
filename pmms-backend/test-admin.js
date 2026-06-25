const { supabaseAdmin } = require('./src/config/supabase');

async function run() {
  if (!supabaseAdmin) {
    console.error('supabaseAdmin is not configured. Check SUPABASE_SERVICE_ROLE_KEY in your environment.');
    process.exit(1);
  }

  try {
    const email = 'diagnostic+test@example.com';
    const password = 'Test1234!';

    const response = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    console.log('Supabase admin createUser response:');
    console.dir(response, { depth: null, colors: true });
  } catch (error) {
    console.error('Supabase admin createUser threw an error:');
    console.dir(error, { depth: null, colors: true });
  }
}

run();
