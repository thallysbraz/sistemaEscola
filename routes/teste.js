user.senha
  .save()
  .then(() => {
    req.flash("success_msg", "Usuário criado com sucesso!");
    res.redirect("/");
  })
  .catch(err => {
    req.flash("error_msg", "Error ao criar o usuário, tente novamente!");
    res.redirect("/usuarios/registro");
  });
