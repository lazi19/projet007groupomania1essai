import PostMessage from "../models/postMessageModels.js";
import PostComment from "../models/postCommentModels.js";
import User from "../models/userModels.js";
const fs = require("fs");

// Routes CRUD : Create, Read, Update, Delete.

export const createMessage = (req, res, next) => {
  console.log(req.body);
  console.log("ligne 15 req.body" + req.body.messageUrl);
  const messageObject = JSON.parse(req.body.message);
  delete messageObject.id;

  let imagePost = "";

  if (req.file) {
    imagePost = `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`;
  }
  const message = new PostMessage({
    UserId: req.body.UserId,
    message: req.body.message,
    messageUrl: imagePost,
  });
  console.log(message);
  message
    .save()
    .then(() => res.status(201).json({ message: "Publication réussie" }))
    .catch((error) => res.status(400).json({ error }));
};

export const getMessageById = (req, res, next) => {
  // On utilise la méthode findOne et on lui passe l'objet de comparaison, on veut que l'id de la sauce soit le même que le paramètre de requête
  PostMessage.findOne({ id: req.params.id })
    .then((message) => res.status(200).json(message)) // Si ok on retourne une réponse et l'objet
    .catch((error) => res.status(404).json({ error })); // Si erreur on génère une erreur 404 pour dire qu'on ne trouve pas l'objet
};

export const updateMessage = (req, res, next) => {
  let messageObject = {};
  req.file // Si la modification contient une image
    ? (PostMessage.findOne({ id: req.params.id }).then((message) => {
        const filename = message.imageUrl.split("/images/")[1];
        fs.unlinkSync(`images/${filename}`);
      }),
      (messageObject = {
        ...JSON.parse(req.body.message),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }))
    : (messageObject = { ...req.body });

  PostMessage.updateOne(
    { id: req.params.id },
    { ...messageObject, id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Message modifié !" }))
    .catch((error) => res.status(400).json({ error }));
};

export const deleteMessage = (req, res, next) => {
  PostMessage.findOne({ id: req.params.id })
    .then((message) => {
      const filename = message.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        PostMessage.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Message supprimé !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

export const getAllMessages = (req, res, next) => {
  PostMessage.find()
    .then((messages) => res.status(200).json(messages))
    .catch((error) => res.status(400).json({ error }));
};
