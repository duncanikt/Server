const express = require("express");
const app = express();

app.get("/", (req, res) => {
res.json({
    hey: "guys"
});
});

app.listen(6969);
