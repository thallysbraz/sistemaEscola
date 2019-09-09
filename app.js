//carregando modulos
const express = require("express");
const handlebars = require("express-handlebars");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const admin = require("./routes/admin");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const nodemailer = require("nodemailer");

require("./models/Categoria");
require("./models/Postagem");
require("./config/auth")(passport);

const Categoria = mongoose.model("categorias");
const Postagem = mongoose.model("postagens");
const usuarios = require("./routes/usuario");
const app = express();

//configurações

//Sessão
app.use(
  session({
    secret: "885A5AE84FFE73BAB99184CA5B04F405",
    resave: true,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//Middleware
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

//Body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Handlebars
app.engine("handlebars", handlebars({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//Mongoose
mongoose.Promise = global.Promise;
mongoose
  .connect("mongodb://localhost/sistemaEscola")
  .then(() => {
    console.log("conectado ao banco MONGODB");
  })
  .catch(err => {
    console.log("error ao conectar no banco " + err);
  });

//Public
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  next();
});

//rotas
app.get("/", (req, res) => {
  Postagem.find()
    .populate("categoria")
    .sort({ data: "desc" })
    .then(postagens => {
      res.render("index", { postagens: postagens });
    })
    .catch(err => {
      req.flash("error_msg", "Error interno ");
      res.redirect("/404");
    });
});

//view amostra de contact // Usar para cadastrar usuário
app.get("/contact", (req, res) => {
  res.render("contact");
});
app.post("/contact", (req, res) => {
  const output = `
    <p>You have a new contact request</p>
    <h3>Contact Details</h3>
    <ul>  
      <li>Name: ${req.body.name}</li>
      <li>Company: ${req.body.company}</li>
      <li>Email: ${req.body.email}</li>
      <li>Phone: ${req.body.phone}</li>
    </ul>
    <h3>Message</h3>
    <p>${req.body.message}</p>
  `;

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "mail.YOURDOMAIN.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "YOUREMAIL", // generated ethereal user
      pass: "YOURPASSWORD" // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"Nodemailer Contact" <your@email.com>', // sender address
    to: "RECEIVEREMAILS", // list of receivers
    subject: "Node Contact Request", // Subject line
    text: "Hello world?", // plain text body
    html: output // html body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

    res.render("contact", { msg: "Email has been sent" });
  });
});

app.get("/postagem/:slug", (req, res) => {
  Postagem.findOne({ slug: req.params.slug })
    .then(postagem => {
      if (postagem) {
        res.render("postagem/index", { postagem: postagem });
      } else {
        req.flash("error_msg", "Esta postagem não existe!");
        res.redirect("/");
      }
    })
    .catch(err => {
      req.flash("error_msg", "Error interno ao buscar postagem");
      res.redirect("/");
    });
});

//rota para listar categorias
app.get("/categorias", (req, res) => {
  Categoria.find()
    .then(categorias => {
      res.render("categorias/index", { categorias: categorias });
    })
    .catch(err => {
      req.flash("error_msg", "Error ao listar categorias");
      res.redirect("/");
    });
});

app.get("/categorias/:slug", (req, res) => {
  Categoria.findOne({ slug: req.params.slug })
    .then(categoria => {
      if (categoria) {
        Postagem.find({ categoria: categoria._id })
          .then(postagens => {
            res.render("categorias/postagens", {
              postagens: postagens,
              categoria: categoria
            });
          })
          .catch(err => {
            req.flash("error_msg", "Error ao listar posts!");
            res.redirect("/categorias");
          });
      } else {
        req.flash("error_msg", "Essa categoria não existe");
        res.redirect("/categorias");
      }
    })
    .catch(err => {
      req.flash("error_msg", "Houve error ao carregar está página!");
      res.redirect("/categorias");
    });
});

app.get("/404", (req, res) => {
  res.send("Erro 404!");
});

app.get("/posts", (req, res) => {
  Postagem.find()
    .populate("categoria")
    .sort({ data: "desc" })
    .then(postagens => {
      res.render("posts", { postagens: postagens });
    })
    .catch(err => {
      req.flash("error_msg", "Error interno ");
      res.redirect("/404");
    });
});

app.use("/admin", admin); // rota admin
app.use("/usuarios", usuarios); // rota usuario
//outros

app.listen(3000);
