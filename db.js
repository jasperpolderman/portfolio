function getImageDataById() {
  fetch('C:/Users/jaspe/Documents/Github/portfolio/db_json/images.json')
    .then(res => res.json())
    .then(data => {
      console.log(data);
    });
}

getImageDataById();