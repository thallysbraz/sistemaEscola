const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const passport = require("passport");
const mailer = require("../modules/mailer");
const nodemailer = require("nodemailer");

require("dotenv").config();
require("../models/Usuario");

const { eAdmin } = require("../helpers/eAdmin");
const Usuario = mongoose.model("usuarios");

router.get("/registro", (req, res) => {
  res.render("usuarios/registro");
});

//validação de usuário
router.post("/registro", (req, res) => {
  var erros = [];
  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: "Nome inválido" });
  }
  if (
    !req.body.email ||
    typeof req.body.email == undefined ||
    req.body.email == null
  ) {
    erros.push({ texto: "E-mail inválido" });
  }
  if (
    !req.body.senha ||
    typeof req.body.senha == undefined ||
    req.body.senha == null
  ) {
    erros.push({ texto: "Senha inválido" });
  }
  if (req.body.senha.length < 4) {
    erros.push({ texto: "Senha muito curta" });
  }
  if (req.body.senha != req.body.senha2) {
    erros.push({ texto: "as senhas são diferentes" });
  }
  if (erros.length > 0) {
    res.render("usuarios/registro", { erros: erros });
  } else {
    Usuario.findOne({ email: req.body.email })
      .then(usuario => {
        if (usuario) {
          req.flash("error_msg", "Email ja registrado!");
          res.redirect("/usuarios/registro");
        } else {
          const novoUsuario = new Usuario({
            nome: req.body.nome,
            email: req.body.email,
            senha: req.body.senha
          });
          bcrypt.genSalt(10, (erro, salt) => {
            bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
              if (erro) {
                req.flash("error_msg", "Error ao salvar usuário");
                res.redirect("/");
              }
              novoUsuario.senha = hash;
              novoUsuario
                .save()
                .then(() => {
                  //iniciando envio de email
                  let transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                      user: process.env.EMAIL,
                      pass: process.env.PASSWORD
                    }
                  });

                  let mailOptions = {
                    from: "",
                    to: req.body.email,
                    subject: "Seja bem-vindo", //assunto
                    text: "Bem-vindo ao Blog App"
                  };

                  transporter.sendMail(mailOptions, function(err, data) {
                    if (err) {
                      req.flash(
                        "error_msg",
                        "Error ao criar o usuário, tente novamente!"
                      );
                      res.redirect("/usuarios/registro");
                      //console.log("error occurs: ", err);
                    } else {
                      console.log("email enviado!!!");
                    }
                  });

                  //finalizando envio de email
                  req.flash("success_msg", "Usuário criado com sucesso!");
                  res.redirect("/");
                })
                .catch(err => {
                  req.flash(
                    "error_msg",
                    "Error ao criar o usuário, tente novamente!"
                  );
                  res.redirect("/usuarios/registro");
                });
            });
          });
        }
      })
      .catch(err => {
        req.flash("error_msg", "Houve error interno");
        res.redirect("/");
      });
  }
});

router.get("/registroADM", eAdmin, (req, res) => {
  res.render("usuarios/registroADM");
});

//validação de usuário
router.post("/registroADM", eAdmin, (req, res) => {
  var erros = [];
  if (
    !req.body.nome ||
    typeof req.body.nome == undefined ||
    req.body.nome == null
  ) {
    erros.push({ texto: "Nome inválido" });
  }
  if (
    !req.body.email ||
    typeof req.body.email == undefined ||
    req.body.email == null
  ) {
    erros.push({ texto: "E-mail inválido" });
  }
  if (
    !req.body.senha ||
    typeof req.body.senha == undefined ||
    req.body.senha == null
  ) {
    erros.push({ texto: "Senha inválido" });
  }
  if (req.body.senha.length < 4) {
    erros.push({ texto: "Senha muito curta" });
  }
  if (req.body.senha != req.body.senha2) {
    erros.push({ texto: "as senhas são diferentes" });
  }
  if (erros.length > 0) {
    res.render("usuarios/registroADM", { erros: erros });
  } else {
    Usuario.findOne({ email: req.body.email })
      .then(usuario => {
        if (usuario) {
          req.flash("error_msg", "Email ja registrado!");
          res.redirect("/usuarios/registroADM");
        } else {
          const novoUsuario = new Usuario({
            nome: req.body.nome,
            email: req.body.email,
            senha: req.body.senha,
            eAdmin: 1
          });
          bcrypt.genSalt(10, (erro, salt) => {
            bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
              if (erro) {
                req.flash("error_msg", "Error ao salvar usuário");
                res.redirect("/");
              }
              novoUsuario.senha = hash;
              novoUsuario
                .save()
                .then(() => {
                  //iniciando envio de email
                  let transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                      user: process.env.EMAIL,
                      pass: process.env.PASSWORD
                    }
                  });

                  let mailOptions = {
                    from: "",
                    to: req.body.email,
                    subject: "Seja bem-vindo", //assunto
                    text: "Bem-vindo ao Blog App"
                  };

                  transporter.sendMail(mailOptions, function(err, data) {
                    if (err) {
                      req.flash(
                        "error_msg",
                        "Error ao criar o usuário, tente novamente!"
                      );
                      res.redirect("/usuarios/registro");
                      //console.log("error occurs: ", err);
                    } else {
                      console.log("email enviado!!!");
                    }
                  });

                  //finalizando envio de email
                  req.flash(
                    "success_msg",
                    "Usuário Admnistrador criado com sucesso!"
                  );
                  res.redirect("/");
                })
                .catch(err => {
                  req.flash(
                    "error_msg",
                    "Error ao criar o usuário, tente novamente!"
                  );
                  res.redirect("/usuarios/registroADM");
                });
            });
          });
        }
      })
      .catch(err => {
        req.flash("error_msg", "Houve error interno");
        res.redirect("/");
      });
  }
});

//rota de login de usuario
router.get("/login", (req, res) => {
  res.render("usuarios/login");
});
//rota para logar o usuario
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/usuarios/login",
    failureFlash: true
  })(req, res, next);
});

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success_msg", "Deslogado com sucesso!");
  res.redirect("/");
});

router.get("/forgot_password", (req, res) => {
  res.render("usuarios/forgot_password");
});

router.post("/forgot_password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await Usuario.findOne({ email }); // verificando se o email esta cadastrado

    if (!user) {
      return res.status(400).send({ error: "Usuario não existe" });
    }
    const token = crypto.randomBytes(20).toString("hex"); //gerando um token

    const now = new Date();
    now.setHours(now.getHours() + 1);

    await Usuario.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now
      }
    });
    //console.log(token, now);
    mailer.sendMail(
      {
        to: email,
        from: "thallys.braz@firstdecision.com.br",
        template: "auth/forgot_password",
        context: { token }
      },
      err => {
        if (err) {
          res
            .status(401)
            .send({ error: "Cannot send forgot password email, ok" });
        }
      }
    );
    //console.log("chegou aqui");

    res.redirect("/usuarios/reset_password");
  } catch (err) {
    //console.log(err);
    res.status(400).send({ error: "Error na rota de esqueci minha senha." });
  }
});

router.get("/reset_password", (req, res) => {
  res.render("usuarios/reset_password");
});

router.post("/reset_password", async (req, res) => {
  const { email, token, senha } = req.body;
  const user = await Usuario.findOne({ email });
  if (!user) {
    //verificando se email e valido. arrumar vieew de error
    req.flash("error_msg", "Usuario não existe");
    res.redirect("/usuarios/reset_password");
  }
  try {
    const user = await Usuario.findOne({ email }).select(
      "+passwordResetToken passwordResetExpires"
    );

    if (!user) {
      //verificando se usuário exites
      req.flash("error_msg", "Usuário incorreto!");
      res.redirect("/usuarios/reset_password");
    }
    //console.log(token);
    if (token !== user.passwordResetToken) {
      // verificar se o token e valido
      req.flash("error_msg", "Token invalido");
      res.redirect("/usuarios/reset_password");
    }
    //verificar se o token esta expirado
    const now = new Date();

    if (now > user.passwordResetExpires) {
      req.flash("error_msg", "Token expirado, por favor gerar novo token");
      res.redirect("/usuarios/reset_password");
    }

    if (req.body.senha != req.body.senha2) {
      req.flash("error_msg", "Senhas são diferentes");
      res.redirect("/usuarios/reset_password");
    }

    //atualizando senha.

    user.senha = senha;
    //console.log("user senha:", user.senha);
    //await user.save();

    bcrypt.genSalt(10, (erro, salt) => {
      bcrypt.hash(user.senha, salt, (erro, hash) => {
        if (erro) {
          req.flash("error_msg", "Error ao salvar usuário");
          res.redirect("/");
        }
        user.senha = hash;
        user
          .save()
          .then(() => {
            req.flash("success_msg", "senha alterada com sucesso!");
            res.redirect("/");
          })
          .catch(err => {
            req.flash(
              "error_msg",
              "Error ao criar o usuário, tente novamente!"
            );
            res.redirect("/usuarios/registro");
          });
      });
    });
  } catch (err) {
    res.status(400).send({ error: "Cannot reset passord, try again" });
  }
});

module.exports = router;
