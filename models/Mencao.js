const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Mencao = new Schema({
  nome: {
    type: String,
    require: true
  },
  slug: {
    type: String,
    require: true
  },
  disciplina: {
    type: Date,
    default: Date.now()
  },
  nota: {
    num: String
  }
});

mongoose.model("mencoes", Mencao);
