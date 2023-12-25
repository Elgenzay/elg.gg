function copy(elem) {
    elem.select();

    if (navigator.clipboard) {
        navigator.clipboard.writeText(elem.value)
    } else {
        document.execCommand("copy");
    }
}

function submit(data) {
    let url = `${window.location.protocol}//${window.location.hostname}${window.location.port ? ':' + window.location.port : ''}/clipboard`;

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain'
        },
        body: data
    })
        .then(response => response.text())
        .then(data => {
            let elem = document.getElementById("output");
            elem.value = data;
            copy(elem);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
