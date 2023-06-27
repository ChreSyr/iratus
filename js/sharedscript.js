
function handleMenuClick(button) {

  switch (button) {
    case "contact":
    case "puzzle":
    case "rules":
      console.log(button);
      window.location.href = button + ".html";
      break;
  }

}