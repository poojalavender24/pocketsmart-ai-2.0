require('dotenv').config();
const express = require('express'), cors = require('cors'), mongoose = require('mongoose');
const app = express();
app.use(cors(), express.json());
// Add new features by mounting another router here
app.use('/api/auth', require('./routes/auth'));
app.use('/api/transactions', require('./routes/transactions'));
app.get('/api/categories', (q, r) => r.json(require('./config/categories')));
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pocketsmart')
  .then(() => app.listen(process.env.PORT || 5000, () => console.log('PocketSmart API running')))
  .catch(e => { console.error('MongoDB connection failed:', e.message); process.exit(1); });
