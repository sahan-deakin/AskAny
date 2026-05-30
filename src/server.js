const app = require('./app');
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AskAny API running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
