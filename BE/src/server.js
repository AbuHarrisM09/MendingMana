const app = require('./app');
const env = require('./config/env');

app.listen(env.port, () => {
  console.log(`MendingMana backend running on port ${env.port}`);
});
