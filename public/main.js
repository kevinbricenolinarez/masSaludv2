async function loadImage() {

    console.log("Solicitando imagen");

    let imagenF = await fetch("https://cors-anywhere.herokuapp.com/https://pixabay.com/api/?key=18417313-8db5d63467db4c943cbfdf947&q=cake&image_type=photo")

    console.log(imagenF);
}

loadImage();