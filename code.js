
function setStyle(num) {
    var theme = document.getElementsByTagName('link')[0];
    theme.setAttribute('href', 'stylesheet' + num + '.css')
}