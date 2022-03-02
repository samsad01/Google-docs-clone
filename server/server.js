const mongoose = require("mongoose");
const Document = require("./Document");

require("dotenv").config();

/*mongoose.connect(
  "mongodb+srv://soham01:Sohamsadhu@123@soham.emrhw.mongodb.net/GoogleDocsDatabase?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);*/
try {
  mongoose.connect(
    process.env.DB,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    },
    () => console.log("⚡ Mongoose is connected ... ")
  );
} catch (error) {
  console.log("🧨🧨 ", error);
}
const io = require("socket.io")(process.env.PORT || 3001, {
  cors: {
    // origin: "https://romantic-edison-dc0acb.netlify.app",
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const defaultValue = "";

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
  });

  // console.log("connected");
});

async function findOrCreateDocument(id) {
  if (id == null) return;

  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: defaultValue });
}
