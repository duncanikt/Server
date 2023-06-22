const express = require("express");
const app = express();

app.get("/", (req, res) => {
res.json({
    hey: "guys",
    hey: "guys",
    });
});

app.listen(process.env.PORT || 6969);
