const express = require('express');
const app = express();
const cors = require('cors');
const PORT = 3001;

app.use(express.json());
app.use(cors());

// APIルート例
app.get('/api/hello', (req, res) => {
  res.json({ message: "Hello from Express!" });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});