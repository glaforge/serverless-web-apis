console.log('App started');

document.addEventListener("DOMContentLoaded", async function(event) {
    const response = await fetch('https://run-crud-sh43zgzkgq-ew.a.run.app/books');
    console.log(response.json());
});
